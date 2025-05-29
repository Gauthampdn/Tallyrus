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
    it("returns 400 if no file uploaded", async () => {
      await uploadFile(
        { params: { id: "x" }, file: null, user: { authority: "student", id: "u1" } },
        res
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "No file uploaded." });
    });

    it("returns 400 if uploaded file is not a PDF", async () => {
      await uploadFile(
        { params: { id: "x" }, file: { location: "file.txt", key: "file.txt" }, user: { authority: "student", id: "u1" } },
        res
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Only PDF submissions are allowed" });
    });

    it("returns 403 if user is not a student", async () => {
      await uploadFile(
        { params: { id: "x" }, file: { location: "test.pdf", key: "test.pdf" }, user: { authority: "teacher", id: "u1" } },
        res
      );
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: "Only students can submit assignments" });
    });

    it("returns 404 for invalid assignment ID", async () => {
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false);
      req.params.id = "invalid";
      req.file = { location: "test.pdf", key: "test.pdf" };
      await uploadFile(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "No such Template and invalid ID" });
    });

    it("returns 404 if assignment not found", async () => {
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      req.params.id = "id";
      req.file = { location: "test.pdf", key: "test.pdf" };
      Assignment.findById.mockResolvedValue(null);
      await uploadFile(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Assignment not found" });
    });

    it("returns 403 if student not in class", async () => {
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      req.params.id = "id";
      req.file = { location: "test.pdf", key: "test.pdf" };
      Assignment.findById.mockResolvedValue({ classId: "c1", submissions: [] });
      Classroom.findOne.mockResolvedValue(null);
      await uploadFile(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: "Not authorized to submit to this assignment" });
    });

    it("creates a new submission when none exists", async () => {
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      req.params.id = "id";
      req.file = { location: "test.pdf", key: "test.pdf" };
      const assignment = { classId: "c1", submissions: [], save: jest.fn() };
      Assignment.findById.mockResolvedValue(assignment);
      Classroom.findOne.mockResolvedValue({ _id: "c1", students: ["u1"] });

      await uploadFile(req, res);

      // new submission pushed
      expect(assignment.submissions).toHaveLength(1);
      const sub = assignment.submissions[0];
      expect(sub.pdfURL).toBe("test.pdf");
      expect(sub.pdfKey).toBe("test.pdf");
      expect(sub.status).toBe("grading");
      expect(assignment.save).toHaveBeenCalled();
      // background grading triggered
      expect(openaiCtrl.gradeSubmission).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(sub);
    });

    it("updates existing submission and deletes the old file", async () => {
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      req.params.id = "id";
      req.file = { location: "new.pdf", key: "new.pdf" };
      const oldSub = { studentId: "u1", pdfKey: "old.pdf", dateSubmitted: null, pdfURL: null, status: null, feedback: [] };
      const assignment = { classId: "c1", submissions: [oldSub], save: jest.fn() };
      Assignment.findById.mockResolvedValue(assignment);
      Classroom.findOne.mockResolvedValue({ _id: "c1", students: ["u1"] });
      s3.deleteObject.mockResolvedValue({});

      await uploadFile(req, res);

      expect(s3.deleteObject).toHaveBeenCalledWith({ Bucket: process.env.AWSS3_BUCKETNAME, Key: "old.pdf" });
      expect(assignment.submissions[0].pdfKey).toBe("new.pdf");
      expect(assignment.save).toHaveBeenCalled();
      expect(openaiCtrl.gradeSubmission).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("returns 500 if deleting the old file fails", async () => {
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      req.params.id = "id";
      req.file = { location: "new.pdf", key: "new.pdf" };
      const oldSub = { studentId: "u1", pdfKey: "old.pdf", submissions: [] };
      const assignment = { classId: "c1", submissions: [oldSub], save: jest.fn() };
      Assignment.findById.mockResolvedValue(assignment);
      Classroom.findOne.mockResolvedValue({ _id: "c1", students: ["u1"] });
      s3.deleteObject.mockRejectedValue(new Error("fail"));

      await uploadFile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to delete the existing submission file." });
    });

    it("returns 500 on unexpected errors", async () => {
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      req.params.id = "id";
      req.file = { location: "test.pdf", key: "test.pdf" };
      Assignment.findById.mockRejectedValue(new Error("boom"));

      await uploadFile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "boom" });
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

  describe("uploadTeacherFile", () => {
    it("returns 400 if no files uploaded", async () => {
      req.files = [];
      await uploadTeacherFile(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "No files uploaded." });
    });

    it("returns 403 if user is not a teacher", async () => {
      req.user.authority = "student";
      req.files = [{ location: "test.pdf", key: "test.pdf" }];
      await uploadTeacherFile(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Only teachers can upload files",
      });
    });

    it("returns 404 for invalid assignment ID", async () => {
      req.user.authority = "teacher";
      req.files = [{ location: "test.pdf", key: "test.pdf" }];
      mongoose.Types.ObjectId.isValid.mockReturnValue(false);
      await uploadTeacherFile(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid assignment ID" });
    });

    it("returns 404 if assignment not found", async () => {
      req.user.authority = "teacher";
      req.files = [{ location: "test.pdf", key: "test.pdf" }];
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      Assignment.findById.mockResolvedValue(null);
      await uploadTeacherFile(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Assignment not found" });
    });

    it("returns 403 if teacher not in classroom", async () => {
      req.user.authority = "teacher";
      req.files = [{ location: "test.pdf", key: "test.pdf" }];
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      const mockAssignment = { _id: "assign123", classId: "class123" };
      Assignment.findById.mockResolvedValue(mockAssignment);
      Classroom.findOne.mockResolvedValue(null);
      await uploadTeacherFile(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Not authorized to upload files for this assignment",
      });
    });

    it('uploads files and returns 201 with a success message and the submissions array', async () => {
      // Arrange: make the ID valid, user a teacher, and two fake files
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      req.params.id     = 'assignment123';
      req.user          = { authority: 'teacher', id: 'teacher123' };
      req.files         = [
        { location: 'https://s3.bucket/one.pdf', key: 'one.pdf' },
        { location: 'https://s3.bucket/two.pdf', key: 'two.pdf' }
      ];

      // Mock the database lookups
      const assignment = {
        classId: 'classABC',
        submissions: [],
        save: jest.fn().mockResolvedValue(true)
      };
      Assignment.findById.mockResolvedValue(assignment);
      Classroom.findOne.mockResolvedValue({ _id: 'classABC', teachers: ['teacher123'] });

      // Act
      await uploadTeacherFile(req, res);

      // Assert: we pushed both files, saved twice, and returned the right payload
      expect(assignment.submissions).toHaveLength(2);
      expect(assignment.submissions[0]).toMatchObject({
        pdfURL: 'https://s3.bucket/one.pdf',
        pdfKey: 'one.pdf',
        status: 'submitted'
      });
      expect(assignment.submissions[1]).toMatchObject({
        pdfURL: 'https://s3.bucket/two.pdf',
        pdfKey: 'two.pdf',
        status: 'submitted'
      });
      expect(assignment.save).toHaveBeenCalledTimes(2);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Files uploaded successfully',
        files: assignment.submissions
      });
    });

    it("uploads files successfully", async () => {
      req.user.authority = "teacher";
      req.files = [
        { location: "https://example.com/test.pdf", key: "test.pdf" },
      ];
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      const mockAssignment = {
        _id: "assign123",
        classId: "class123",
        submissions: [],
      };
      const mockClassroom = { _id: "class123", teachers: ["u1"] };

      Assignment.findById.mockResolvedValue(mockAssignment);
      Classroom.findOne.mockResolvedValue(mockClassroom);

      await uploadTeacherFile(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(mockAssignment.submissions).toHaveLength(1);
      expect(mockAssignment.submissions[0]).toMatchObject({
        studentName: "test.pdf",
        studentId: "test.pdf",
        pdfURL: "https://example.com/test.pdf",
        pdfKey: "test.pdf",
        status: "submitted",
      });
    });
  });

  describe("downloadFile", () => {
    it("downloads file successfully", async () => {
      req.params.filename = "test.pdf";
      const mockStream = {
        pipe: jest.fn(),
      };
      s3.getObject.mockResolvedValue({
        Body: mockStream,
        ContentType: "application/pdf",
      });

      await downloadFile(req, res);

      expect(res.setHeader).toHaveBeenCalledWith(
        "Content-Disposition",
        "inline"
      );
      expect(res.setHeader).toHaveBeenCalledWith(
        "Content-Type",
        "application/pdf"
      );
      expect(mockStream.pipe).toHaveBeenCalledWith(res);
    });

    it("handles S3 errors gracefully", async () => {
      req.params.filename = "test.pdf";
      s3.getObject.mockRejectedValue(new Error("S3 error"));
      await downloadFile(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Error downloading file.");
    });
  });

  describe("uploadOldEssays", () => {
    it("returns 400 if no files uploaded", async () => {
      req.files = [];
      await uploadOldEssays(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "No files uploaded." });
    });

    it("returns 403 if user is not a teacher", async () => {
      req.user.authority = "student";
      req.files = [{ location: "test.pdf", key: "test.pdf" }];
      await uploadOldEssays(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Only teachers can upload old graded essays",
      });
    });

    it("returns 404 if teacher not found", async () => {
      req.user.authority = "teacher";
      req.files = [{ location: "test.pdf", key: "test.pdf" }];
      User.findOne.mockResolvedValue(null);
      await uploadOldEssays(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Teacher not found" });
    });

    it("uploads old essays successfully", async () => {
      req.user.authority = "teacher";
      req.user.name = "Test Teacher";
      req.files = [
        { location: "https://example.com/essay.pdf", key: "essay.pdf" },
      ];
      const mockTeacher = {
        _id: "teacher123",
        uploadedFiles: [],
      };

      User.findOne.mockResolvedValue(mockTeacher);

      await uploadOldEssays(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(mockTeacher.uploadedFiles).toHaveLength(1);
      expect(mockTeacher.uploadedFiles[0]).toMatchObject({
        studentName: "Old Graded Essay by Test Teacher",
        pdfURL: "https://example.com/essay.pdf",
        pdfKey: "essay.pdf",
        status: "graded",
        isOldGradedEssay: true,
      });
    });
  });
});
