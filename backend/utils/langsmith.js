const { ChatOpenAI } = require("@langchain/openai");
const { LangChainTracer } = require("langchain/callbacks");

// Set up the environment variables
process.env.LANGSMITH_API_KEY = "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"; // Your key
process.env.LANGSMITH_PROJECT = "pr-somber-opportunity-12"; // Your project name

// Create a tracer that will send data to LangSmith
console.log("Initializing LangChain tracer with project:", process.env.LANGSMITH_PROJECT);

// Create a tracer that will send data to LangSmith
const tracer = new LangChainTracer({
  projectName: process.env.LANGSMITH_PROJECT,
});

console.log("Tracer initialized, creating LLM with callbacks");

// Create LLM instance with the tracer callback
const llm = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  callbacks: [tracer]
});


module.exports = { llm };