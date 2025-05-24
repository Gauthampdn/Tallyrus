const mongoose = require("mongoose");
const {
  getAssignment,
  getAssignments,
  createAssignment,
  deleteAssignment,
  getSubmissions,
  updateAssignmentRubric,
  updateSubmission,
  createSubmissionComment,
} = require("../controllers/assignmentController");
const Assignment = require("../models/assignmentModel");
const Classroom = require("../models/classroomModel");

jest.mock("../models/assignmentModel");
jest.mock("../models/classroomModel");

describe("assignmentController", () => {
  let req, res;

  beforeEach(() => {
    jest.resetAllMocks();
    req = {
      params: {},
      body: {},
      user: { id: "u1", authority: "student" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  describe("getAssignment", () => {
    it("returns 404 if ID is invalid", async () => {
      req.params.id = "invalid";
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false);

      await getAssignment(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "No such Template and invalid ID",
      });
    });

    it("returns 404 if no assignment found", async () => {
      req.params.id = "validId";
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      Assignment.findById.mockResolvedValue(null);

      await getAssignment(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Assignment not found" });
    });

    it("returns 200 and assignment when found", async () => {
      req.params.id = "validId";
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      const mockAssignment = { _id: "validId", title: "Test Assignment" };
      Assignment.findById.mockResolvedValue(mockAssignment);

      await getAssignment(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockAssignment);
    });

    it("handles database errors gracefully", async () => {
      req.params.id = "validId";
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      Assignment.findById.mockRejectedValue(new Error("Database error"));

      await getAssignment(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
    });

    it("handles missing assignment ID parameter", async () => {
      req.params.id = undefined;
      await getAssignment(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "No such Template and invalid ID",
      });
    });
  });

  describe("getAssignments", () => {
    it("returns 400 for invalid classroom ID", async () => {
      req.params.classId = "invalid";
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false);

      await getAssignments(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid classroom ID" });
    });

    it("returns 400 for invalid user authority", async () => {
      req.params.classId = "validId";
      req.user.authority = "invalid";
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);

      await getAssignments(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid user authority",
      });
    });

    it("returns 400 if classroom not found", async () => {
      req.params.classId = "validId";
      req.user.authority = "student";
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      Classroom.findById.mockResolvedValue(null);

      await getAssignments(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Classroom not found" });
    });

    it("returns filtered submissions for students", async () => {
      req.params.classId = "validId";
      req.user.authority = "student";
      req.user.id = "studentId";
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      const mockClassroom = { _id: "validId" };
      const mockAssignments = [
        {
          _id: "a1",
          submissions: [
            { studentId: "studentId", score: 90 },
            { studentId: "otherId", score: 85 },
          ],
        },
      ];

      Classroom.findById.mockResolvedValue(mockClassroom);
      Assignment.find.mockResolvedValue(mockAssignments);

      await getAssignments(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        {
          _id: "a1",
          submissions: [{ studentId: "studentId", score: 90 }],
        },
      ]);
    });

    it("returns all submissions for teachers", async () => {
      req.params.classId = "validId";
      req.user.authority = "teacher";
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      const mockClassroom = { _id: "validId" };
      const mockAssignments = [
        {
          _id: "a1",
          submissions: [
            { studentId: "student1", score: 90 },
            { studentId: "student2", score: 85 },
          ],
        },
      ];

      Classroom.findById.mockResolvedValue(mockClassroom);
      Assignment.find.mockResolvedValue(mockAssignments);

      await getAssignments(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockAssignments);
    });
  });

  describe("createAssignment", () => {
    it("returns 403 if user is not a teacher", async () => {
      req.user.authority = "student";
      await createAssignment(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Only teachers can create assignments",
      });
    });

    it("returns 400 for invalid classroom ID", async () => {
      req.user.authority = "teacher";
      req.body.classId = "invalid";
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false);

      await createAssignment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid classroom ID" });
    });

    it("returns 400 if teacher not authorized for classroom", async () => {
      req.user.authority = "teacher";
      req.body.classId = "validId";
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      const mockClassroom = { _id: "validId", teachers: ["otherTeacher"] };

      Classroom.findById.mockResolvedValue(mockClassroom);

      await createAssignment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Teacher not authorized for this classroom",
      });
    });

    it("creates assignment successfully", async () => {
      req.user.authority = "teacher";
      req.body = {
        classId: "validId",
        title: "Test Assignment",
        description: "Test Description",
      };
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      const mockClassroom = { _id: "validId", teachers: ["u1"] };
      const mockAssignment = {
        _id: "newId",
        ...req.body,
        save: jest.fn().mockResolvedValue(true),
      };

      Classroom.findById.mockResolvedValue(mockClassroom);
      Assignment.mockImplementation(() => mockAssignment);

      await createAssignment(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockAssignment);
    });
  });

  describe("deleteAssignment", () => {
    it("returns 403 if user is not a teacher", async () => {
      req.user.authority = "student";
      await deleteAssignment(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Only teachers can delete assignments",
      });
    });

    it("returns 404 if assignment not found", async () => {
      req.user.authority = "teacher";
      req.params.id = "validId";
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      Assignment.findById.mockResolvedValue(null);

      await deleteAssignment(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Assignment not found" });
    });

    it("returns 403 if teacher not authorized for classroom", async () => {
      req.user.authority = "teacher";
      req.params.id = "validId";
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      const mockAssignment = { _id: "validId", classId: "classId" };
      const mockClassroom = { _id: "classId", teachers: ["otherTeacher"] };

      Assignment.findById.mockResolvedValue(mockAssignment);
      Classroom.findById.mockResolvedValue(mockClassroom);

      await deleteAssignment(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Not authorized to delete this assignment",
      });
    });

    it("deletes assignment and associated files successfully", async () => {
      req.user.authority = "teacher";
      req.params.id = "validId";
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      const mockAssignment = {
        _id: "validId",
        classId: "classId",
        submissions: [{ pdfKey: "file1.pdf" }],
        remove: jest.fn().mockResolvedValue(true),
      };
      const mockClassroom = { _id: "classId", teachers: ["u1"] };

      Assignment.findById.mockResolvedValue(mockAssignment);
      Classroom.findById.mockResolvedValue(mockClassroom);

      await deleteAssignment(req, res);

      expect(mockAssignment.remove).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Assignment and associated files deleted successfully",
      });
    });
  });

  describe("updateAssignmentRubric", () => {
    it("returns 403 if user is not a teacher", async () => {
      req.user.authority = "student";
      await updateAssignmentRubric(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Only teachers can update rubrics",
      });
    });

    it("returns 400 for invalid assignment ID", async () => {
      req.user.authority = "teacher";
      req.params.id = "invalid";
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false);

      await updateAssignmentRubric(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid assignment ID" });
    });

    it("returns 404 if assignment not found", async () => {
      req.user.authority = "teacher";
      req.params.id = "validId";
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      Assignment.findById.mockResolvedValue(null);

      await updateAssignmentRubric(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Assignment not found" });
    });

    it("updates rubric successfully", async () => {
      req.user.authority = "teacher";
      req.params.id = "validId";
      req.body.rubric = { score: 100 };
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      const mockAssignment = {
        _id: "validId",
        rubric: null,
        save: jest.fn().mockResolvedValue(true),
      };

      Assignment.findById.mockResolvedValue(mockAssignment);

      await updateAssignmentRubric(req, res);

      expect(mockAssignment.rubric).toEqual(req.body.rubric);
      expect(mockAssignment.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockAssignment);
    });
  });

  describe("updateSubmission", () => {
    it("returns 403 if user is not a teacher", async () => {
      req.user.authority = "student";
      await updateSubmission(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Only teachers can update submissions",
      });
    });

    it("returns 400 for invalid IDs", async () => {
      req.user.authority = "teacher";
      req.params.assignmentId = "invalid";
      req.params.submissionId = "invalid";
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false);

      await updateSubmission(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid IDs" });
    });

    it("returns 404 if assignment not found", async () => {
      req.user.authority = "teacher";
      req.params.assignmentId = "validId";
      req.params.submissionId = "validId";
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      Assignment.findById.mockResolvedValue(null);

      await updateSubmission(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Assignment not found" });
    });

    it("returns 404 if submission not found", async () => {
      req.user.authority = "teacher";
      req.params.assignmentId = "validId";
      req.params.submissionId = "validId";
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      const mockAssignment = {
        _id: "validId",
        submissions: [],
      };

      Assignment.findById.mockResolvedValue(mockAssignment);

      await updateSubmission(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Submission not found" });
    });

    it("updates submission successfully", async () => {
      req.user.authority = "teacher";
      req.params.assignmentId = "validId";
      req.params.submissionId = "validId";
      req.body = { score: 90, feedback: "Great job!" };
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      const mockAssignment = {
        _id: "validId",
        submissions: [{ _id: "validId", score: 0 }],
        save: jest.fn().mockResolvedValue(true),
      };

      Assignment.findById.mockResolvedValue(mockAssignment);

      await updateSubmission(req, res);

      expect(mockAssignment.submissions[0].score).toBe(90);
      expect(mockAssignment.submissions[0].feedback).toBe("Great job!");
      expect(mockAssignment.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockAssignment.submissions[0]);
    });
  });

  describe("createSubmissionComment", () => {
    it("returns 400 if comment text is missing", async () => {
      req.body = {};
      await createSubmissionComment(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Comment text is required",
      });
    });

    it("returns 400 for invalid IDs", async () => {
      req.body = { text: "Test comment" };
      req.params.assignmentId = "invalid";
      req.params.submissionId = "invalid";
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false);

      await createSubmissionComment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid IDs" });
    });

    it("returns 404 if assignment not found", async () => {
      req.body = { text: "Test comment" };
      req.params.assignmentId = "validId";
      req.params.submissionId = "validId";
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      Assignment.findById.mockResolvedValue(null);

      await createSubmissionComment(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Assignment not found" });
    });

    it("returns 404 if submission not found", async () => {
      req.body = { text: "Test comment" };
      req.params.assignmentId = "validId";
      req.params.submissionId = "validId";
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      const mockAssignment = {
        _id: "validId",
        submissions: [],
      };

      Assignment.findById.mockResolvedValue(mockAssignment);

      await createSubmissionComment(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Submission not found" });
    });

    it("creates comment successfully", async () => {
      req.body = { text: "Test comment" };
      req.params.assignmentId = "validId";
      req.params.submissionId = "validId";
      req.user = { id: "u1", name: "Test User" };
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      const mockAssignment = {
        _id: "validId",
        submissions: [{ _id: "validId", comments: [] }],
        save: jest.fn().mockResolvedValue(true),
      };

      Assignment.findById.mockResolvedValue(mockAssignment);

      await createSubmissionComment(req, res);

      expect(mockAssignment.submissions[0].comments).toHaveLength(1);
      expect(mockAssignment.submissions[0].comments[0]).toMatchObject({
        text: "Test comment",
        author: "u1",
        authorName: "Test User",
      });
      expect(mockAssignment.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        mockAssignment.submissions[0].comments[0]
      );
    });
  });
});
