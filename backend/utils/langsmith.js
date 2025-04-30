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

// Create LLM instance with the tracer callback and function calling support
const llm = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-3.5-turbo-0125",
  temperature: 0,
  callbacks: [tracer],
  maxTokens: 300,
});

// Function definitions that will be used across the application
const functions = [
  {
    name: "createClassroom",
    description: "Create a new classroom with a title and description",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "The title of the classroom"
        },
        description: {
          type: "string",
          description: "A description of the classroom"
        }
      },
      required: ["title", "description"]
    }
  },
  {
    name: "createAssignment",
    description: "Create a new assignment in an existing classroom",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name of the assignment"
        },
        description: {
          type: "string",
          description: "A description of the assignment"
        },
        classroomName: {
          type: "string",
          description: "The exact name of the existing classroom where this assignment should be created"
        },
        dueDate: {
          type: "string",
          description: "The due date of the assignment in ISO format (optional)"
        }
      },
      required: ["name", "description", "classroomName"]
    }
  }
];

module.exports = { llm, functions };