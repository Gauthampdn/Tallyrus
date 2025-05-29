// Mock environment variables before requiring the controller
process.env.GOOGLE_CLIENT_ID = "test-client-id";
process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";

// Import the controller functions
const {
  testLangSmith,
  completion,
} = require("../controllers/openaiController");

// Mock the llm from utils/langsmith
jest.mock("../utils/langsmith", () => ({
  llm: { invoke: jest.fn() },
  functions: {},
}));
const { llm } = require("../utils/langsmith");

describe("openaiController", () => {
  let req, res;

  beforeEach(() => {
    jest.resetAllMocks();
    req = {};
    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  describe("testLangSmith", () => {
    it("handles errors and returns 500 with error message", async () => {
      llm.invoke.mockRejectedValue(new Error("fail"));

      await testLangSmith(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "fail" });
    });
  });

  describe("completion", () => {
    it("handles errors by sending 500 status and message", async () => {
      const prompt = "test error";
      req = { body: { prompt } };
      llm.invoke.mockRejectedValue(new Error("oops"));

      await completion(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Error with OpenAI request");
    });
  });
});
