const OpenAI = require('openai');
require("dotenv").config();

const pdfParse = require("pdf-parse");

async function loadPdfJsLib() {
    const pdfjsLib = await import('pdfjs-dist/build/pdf.mjs');
    return pdfjsLib;
}

async function getTextFromPDF(pdfPath) {
    const pdfjsLib = await loadPdfJsLib();
    const loadingTask = pdfjsLib.getDocument(pdfPath);
    const pdf = await loadingTask.promise;
    let extractedText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        extractedText += textContent.items.map(item => item.str).join(' ');
    }

    return extractedText;
}

// const trialtextex = async (req, res) => {
// // Check if req.files is undefined or req.files.file is not present

//     const options = {
//         normalizeWhitespace: true,
//         disableCombineTextItems: true
//     };

//     pdfParse("https://aigradertestbucket.s3.us-west-1.amazonaws.com/2024-01-05T02-13-20.145Z-CHI%2010%20rough%20draft%20%283%29.pdf", options).then(result => {
//         res.send(result.text);
//     });
// };

const trialtextex = async (req, res) => {
    getTextFromPDF("https://aigradertestbucket.s3.us-west-1.amazonaws.com/2024-01-05T02-13-20.145Z-CHI%2010%20rough%20draft%20%283%29.pdf").then(text => {
        console.log(text);
        res.send(text);
    });
};


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


const extractText = async (req, res) => {
    try {
        // Check if req.files is undefined or req.files.file is not present
        // Proceed with file processing
        const result = await getTextFromPDF("https://aigradertestbucket.s3.us-west-1.amazonaws.com/2024-01-05T02-13-20.145Z-CHI%2010%20rough%20draft%20%283%29.pdf");
        console.log(result)
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            max_tokens: 1000,
            messages: [
                {
                    "role": "assistant", "content": `You are a Grader for essays. You will read given essay and then based on the rubric below you will give in depth feedback based on each criteria and then a score for each criteria. You will then give the total score. 

                    This is how each grading rubric should be formatted:
                    
                    """
                    **Criteria Name**:
                    **Comments/suggestions**:
                    **Score**: **(score)/subtotal**
                    """
                    
                    Also give the total scores at the end in this format:
                    
                    ***TOTALSCORE***:
                    
                    Grade for a middle school level, and do not grade too harshly. Try to make scores fall between 100 to 70, closer to 100.

                    `

                },
                {
                "role": "assistant", "content": `
                Rubric:\n
                Content and Depth of Analysis (25 points),\n
                Structure and Organization (25 points),\n
                Argument Strength and Persuasiveness (25 points),\n
                Clarity and Language Use (15 points),\n
                Originality and Insight (10 points)\n` },
                { "role": "user", "content": result }
            ]
        });



        res.json(response);
    } catch (error) {
        console.error("Error with OpenAI request:", error);
        res.status(500).send('Error with OpenAI request');
    }

};




const completion = async (req, res) => {
    try {
        const prompt = req.body.prompt;

        console.log("prompt is " + prompt)

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: prompt
        });


        res.json(response);
    } catch (error) {
        res.status(500).send('Error with OpenAI request');
    }
};



const test = async (req, res) => {

};


module.exports = {
    completion,
    test,
    extractText,
    trialtextex
}