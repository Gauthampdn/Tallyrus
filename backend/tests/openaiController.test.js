// Import the controller functions
const {
  testLangSmith,
  completion,
  formatAIScore,
  parseRubricWithGPT4,
  gradeEssayWithGPT4,
  generateFeedbackWithGPT4,
  generateRubricWithGPT4,
} = require("../controllers/openaiController");
const { OpenAI } = require("openai");

// Mock the llm from utils/langsmith
jest.mock("../utils/langsmith", () => ({
  llm: { invoke: jest.fn() },
  functions: {},
}));
const { llm } = require("../utils/langsmith");

// Mock PDF.js
jest.mock("pdfjs-dist", () => ({
  getDocument: jest.fn().mockResolvedValue({
    numPages: 1,
    getPage: jest.fn().mockResolvedValue({
      getTextContent: jest.fn().mockResolvedValue({
        items: [{ str: "test content" }],
      }),
    }),
  }),
}));

jest.mock("openai");

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

describe("parseRubricWithGPT4", () => {
  let mockOpenAI;

  beforeEach(() => {
    mockOpenAI = {
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    };
    OpenAI.mockImplementation(() => mockOpenAI);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("parses rubric successfully", async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify([{ name: "Test", values: [] }]),
          },
        },
      ],
    };
    mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

    const result = await parseRubricWithGPT4("test rubric");
    expect(result).toEqual([{ name: "Test", values: [] }]);
  });

  it("handles OpenAI errors gracefully", async () => {
    mockOpenAI.chat.completions.create.mockRejectedValue(
      new Error("OpenAI error")
    );
    await expect(parseRubricWithGPT4("test rubric")).rejects.toThrow(
      "OpenAI error"
    );
  });
});

describe("gradeEssayWithGPT4", () => {
  let mockOpenAI;

  beforeEach(() => {
    mockOpenAI = {
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    };
    OpenAI.mockImplementation(() => mockOpenAI);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("grades essay successfully", async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              score: 85,
              feedback: "Good work!",
            }),
          },
        },
      ],
    };
    mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

    const result = await gradeEssayWithGPT4("test essay", [
      { name: "Test", values: [] },
    ]);
    expect(result).toEqual({
      score: 85,
      feedback: "Good work!",
    });
  });

  it("handles OpenAI errors gracefully", async () => {
    mockOpenAI.chat.completions.create.mockRejectedValue(
      new Error("OpenAI error")
    );
    await expect(gradeEssayWithGPT4("test essay", [])).rejects.toThrow(
      "OpenAI error"
    );
  });
});

describe("generateFeedbackWithGPT4", () => {
  let mockOpenAI;

  beforeEach(() => {
    mockOpenAI = {
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    };
    OpenAI.mockImplementation(() => mockOpenAI);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("generates feedback successfully", async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: "Great feedback!",
          },
        },
      ],
    };
    mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

    const result = await generateFeedbackWithGPT4("test essay", [
      { name: "Test", values: [] },
    ]);
    expect(result).toBe("Great feedback!");
  });

  it("handles OpenAI errors gracefully", async () => {
    mockOpenAI.chat.completions.create.mockRejectedValue(
      new Error("OpenAI error")
    );
    await expect(generateFeedbackWithGPT4("test essay", [])).rejects.toThrow(
      "OpenAI error"
    );
  });
});

describe("generateRubricWithGPT4", () => {
  let mockOpenAI;

  beforeEach(() => {
    mockOpenAI = {
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    };
    OpenAI.mockImplementation(() => mockOpenAI);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("generates rubric successfully", async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify([{ name: "Test", values: [] }]),
          },
        },
      ],
    };
    mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

    const result = await generateRubricWithGPT4("test prompt");
    expect(result).toEqual([{ name: "Test", values: [] }]);
  });

  it("handles OpenAI errors gracefully", async () => {
    mockOpenAI.chat.completions.create.mockRejectedValue(
      new Error("OpenAI error")
    );
    await expect(generateRubricWithGPT4("test prompt")).rejects.toThrow(
      "OpenAI error"
    );
  });
});
