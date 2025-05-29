// Set test bucket
process.env.AWSS3_BUCKETNAME = "test-bucket";

// Mock AWS S3 before loading controller
jest.mock("@aws-sdk/client-s3", () => {
  const mockList = jest.fn();
  const mockDelete = jest.fn();
  const mockGet = jest.fn();
  return {
    S3: jest.fn().mockImplementation(() => ({
      listObjectsV2: mockList,
      deleteObject: mockDelete,
      getObject: mockGet,
    })),
  };
});

// Mock models and OpenAI controller
jest.mock("../models/classroomModel");
jest.mock("../models/assignmentModel");
jest.mock("../models/userModel");
jest.mock("../controllers/openaiController", () => ({
  parseRubricWithGPT4: jest.fn(),
  gradeSubmission: jest.fn(),
}));

// Import dependencies after mocks
const mongoose = require("mongoose"); // only here once
const { S3 } = require("@aws-sdk/client-s3");
const s3 = new S3();
const Classroom = require("../models/classroomModel");
const Assignment = require("../models/assignmentModel");
const openaiCtrl = require("../controllers/openaiController");
const {
  listFiles,
  deleteFile,
  uploadFile,
  uploadRubric,
} = require("../controllers/filesController");

let req, res;
beforeEach(() => {
  jest.resetAllMocks();
  req = {
    params: {},
    user: { id: "u1", authority: "student" },
    file: undefined,
    files: undefined,
  };
  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn(),
    setHeader: jest.fn(),
  };
});

describe("filesController", () => {
  describe("listFiles", () => {
    it("sends an array of S3 keys", async () => {
      const contents = [{ Key: "a.pdf" }, { Key: "b.pdf" }];
      s3.listObjectsV2.mockResolvedValue({ Contents: contents });

      await listFiles(req, res);

      expect(s3.listObjectsV2).toHaveBeenCalledWith({
        Bucket: process.env.AWSS3_BUCKETNAME,
      });
      expect(res.send).toHaveBeenCalledWith(["a.pdf", "b.pdf"]);
    });
  });

  describe("deleteFile", () => {
    it("removes submission references and deletes from S3", async () => {
      req.params.filename = "file1.pdf";
      Assignment.updateMany.mockResolvedValue({});
      s3.deleteObject.mockResolvedValue({});

      await deleteFile(req, res);

      expect(Assignment.updateMany).toHaveBeenCalledWith(
        { "submissions.pdfKey": "file1.pdf" },
        { $pull: { submissions: { pdfKey: "file1.pdf" } } }
      );
      expect(s3.deleteObject).toHaveBeenCalledWith({
        Bucket: process.env.AWSS3_BUCKETNAME,
        Key: "file1.pdf",
      });
      expect(res.send).toHaveBeenCalledWith("File Deleted Successfully");
    });
  });

  describe("uploadFile", () => {
    it("returns 400 when no file provided", async () => {
      req.params.id = "123"; // id irrelevant here
      req.file = undefined;

      await uploadFile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "No file uploaded." });
    });

    it("returns 403 when non-student tries to upload", async () => {
      req.file = { location: "test.pdf", key: "test.pdf" };
      req.user.authority = "teacher";

      await uploadFile(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Only students can submit assignments",
      });
    });
  });

  describe("uploadRubric", () => {
    it("returns 400 when no file provided", async () => {
      req.params.id = "aid";
      req.user.authority = "teacher";
      req.file = undefined;

      await uploadRubric(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "No file uploaded." });
    });

    it("calls OpenAI parser and returns parsed rubric", async () => {
      req.params.id = "aid";
      req.user.authority = "teacher";
      req.file = { location: "rubric.pdf" };
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      const fakeAssign = { classId: "c1", rubric: null, save: jest.fn() };
      const fakeClass = {}; // content not checked here
      const parsed = { score: 10 };

      openaiCtrl.parseRubricWithGPT4.mockResolvedValue(parsed);
      Assignment.findById.mockResolvedValue(fakeAssign);
      Classroom.findOne.mockResolvedValue(fakeClass);

      await uploadRubric(req, res);

      expect(openaiCtrl.parseRubricWithGPT4).toHaveBeenCalledWith("rubric.pdf");
      expect(fakeAssign.rubric).toEqual(parsed);
      expect(fakeAssign.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Rubric uploaded and parsed successfully",
        rubric: parsed,
      });
    });
  });
});
