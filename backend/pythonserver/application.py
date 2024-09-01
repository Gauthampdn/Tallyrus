from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from torch import cuda
import torch
import os
import re
from flask import Flask, request, jsonify
import os
import re
import fitz  # PyMuPDF
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.chains.question_answering import load_qa_chain
from langchain.schema import Document
import openai
from concurrent.futures import ThreadPoolExecutor
from cachetools import LRUCache, cached
from joblib import Parallel, delayed
import numpy as np
import faiss
import logging
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
os.environ["TOKENIZERS_PARALLELISM"] = "false"

faiss.omp_set_num_threads(1)


application = Flask(__name__)

# Access token for model authentication
ACCESS_TOKEN = os.getenv("ACCESS_TOKEN")

# Load model and tokenizer
device = 'cuda' if cuda.is_available() else 'cpu'
tokenizer = AutoTokenizer.from_pretrained("PirateXX/AI-Content-Detector", use_auth_token=ACCESS_TOKEN)
model = AutoModelForSequenceClassification.from_pretrained("PirateXX/AI-Content-Detector", use_auth_token=ACCESS_TOKEN)
model.to(device)

def text_to_sentences(text):
    clean_text = text.replace('\n', ' ')
    return re.split(r'(?<=[^A-Z].[.?]) +(?=[A-Z])', clean_text)

def chunks_of_900(text, chunk_size=900):
    sentences = text_to_sentences(text)
    chunks = []
    current_chunk = ""
    for sentence in sentences:
        if len(current_chunk + sentence) <= chunk_size:
            if len(current_chunk) != 0:
                current_chunk += " " + sentence
            else:
                current_chunk += sentence
        else:
            chunks.append(current_chunk)
            current_chunk = sentence
    chunks.append(current_chunk)
    return chunks

def predict(query):
    tokens = tokenizer.encode(query)
    all_tokens = len(tokens)
    tokens = tokens[:tokenizer.model_max_length - 2]
    used_tokens = len(tokens)
    tokens = torch.tensor([tokenizer.bos_token_id] + tokens + [tokenizer.eos_token_id]).unsqueeze(0)
    mask = torch.ones_like(tokens)

    with torch.no_grad():
        logits = model(tokens.to(device), attention_mask=mask.to(device))[0]
        probs = logits.softmax(dim=-1)

    fake, real = probs.detach().cpu().flatten().numpy().tolist()
    return real

def find_real_prob(text):
    chunks_of_text = chunks_of_900(text)
    results = []
    for chunk in chunks_of_text:
        output = predict(chunk)
        results.append([output, len(chunk)])

    ans = 0
    cnt = 0
    for prob, length in results:
        cnt += length
        ans = ans + prob * length
    real_prob = ans / cnt
    return {"Real": real_prob, "Fake": 1-real_prob}

@application.route('/ai-detection', methods=['POST'])
def ai_detection():
    data = request.json
    text = data.get('text', '')
    if not text:
        return jsonify({"error": "No text provided"}), 400
    
    result = find_real_prob(text)
    return jsonify(result)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

@application.route('/grade-essay', methods=['POST'])
def grade_essays():
    try:
        logging.info("Received a request to grade an essay.")
        
        data = request.json
        rubric = data.get('rubric', '')
        essay = data.get('essay', '')
        prompt = data.get('prompt', '')
        old_essays = data.get('old_essays', '')
        
        if not rubric or not essay or not prompt:
            logging.error("Missing data for grading: rubric, essay, or prompt.")
            return jsonify({"error": "Missing data for grading"}), 400
        
        openai.api_key = os.getenv('OPENAI_API_KEY')
        
        logging.info("Initializing OpenAI Embeddings.")
        embedding_model = OpenAIEmbeddings(openai_api_key=os.environ['OPENAI_API_KEY'])

        logging.info("Creating documents from old essays.")
        documents = [Document(page_content=old_essays)]
        doc_texts = [doc.page_content for doc in documents]
        
        logging.info("Generating embeddings for old essays.")
        embeddings = embedding_model.embed_documents(doc_texts)
        embeddings_np = np.array(embeddings, dtype='float32')
        
        logging.info("Setting up FAISS index.")
        embedding_dimension = embeddings_np.shape[1]
        index = faiss.IndexFlatL2(embedding_dimension) 
        faiss.normalize_L2(embeddings_np)
        index.add(embeddings_np)
        
        logging.info("Embedding the current essay.")
        essay_embedding = embedding_model.embed_query(essay)
        essay_embedding_np = np.array([essay_embedding], dtype='float32')
        faiss.normalize_L2(essay_embedding_np)

        logging.info("Performing similarity search.")
        distances, indices = index.search(essay_embedding_np, k=1)
        client = openai.OpenAI(api_key=os.environ['OPENAI_API_KEY'])

        if indices.size > 0 and indices[0][0] != -1:
            relevant_doc_index = indices[0][0]
            context = doc_texts[relevant_doc_index]
            logging.info(f"Found relevant context from old essays at index {relevant_doc_index}.")
            print(context)
            
            logging.info("Generating grading feedback using GPT-4o.")
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": f"Previous Essays and Feedback to Follow: {context}\n\nEssay: {essay}\n\nRubric: {rubric}"}
                ],
                max_tokens=3000
            )
            
            feedback = response.choices[0].message.content
            logging.info("Grading completed successfully.")
            return jsonify({"feedback": feedback})
        else:
            logging.warning("No relevant context found.")
            return jsonify({"error": "No relevant context found."})
    except Exception as e:
        logging.error(f"An error occurred during the grading process: {str(e)}")
        return jsonify({"error": str(e)}), 500
    

if __name__ == '__main__':
    application.run(host='0.0.0.0', port=5001)
