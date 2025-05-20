// Import the controller functions
const {
  testLangSmith,
  completion,
  formatAIScore,
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

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe("testLangSmith", () => {
    it("returns success and response on successful llm.invoke", async () => {
      const fakeResponse = { data: "ok" };
      llm.invoke.mockResolvedValue(fakeResponse);

      await testLangSmith(req, res);

      // Verify invoke called with expected messages array
      expect(llm.invoke).toHaveBeenCalledWith([
        {
          role: "user",
          content: "Hello, provide a short response to test LangSmith tracing",
        },
      ]);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        response: fakeResponse,
      });
    });

    it("handles errors and returns 500 with error message", async () => {
      llm.invoke.mockRejectedValue(new Error("fail"));

      await testLangSmith(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "fail" });
    });
  });

  describe("completion", () => {
    it("invokes llm with prompt and returns JSON on success", async () => {
      const prompt = "hello world";
      req = { body: { prompt } };
      const fake = { choices: [] };
      llm.invoke.mockResolvedValue(fake);

      await completion(req, res);

      expect(llm.invoke).toHaveBeenCalledWith(prompt);
      expect(res.json).toHaveBeenCalledWith(fake);
    });

    it("handles errors by sending 500 status and message", async () => {
      const prompt = "test error";
      req = { body: { prompt } };
      llm.invoke.mockRejectedValue(new Error("oops"));

      await completion(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Error with OpenAI request");
    });
  });

  describe("formatAIScore", () => {
    it("should format score to 2 decimal points", () => {
      expect(formatAIScore(0.87654)).toBe("87.65");
    });
  });
});
