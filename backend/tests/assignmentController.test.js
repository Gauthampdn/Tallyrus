const mongoose = require("mongoose");
const { S3 } = require("@aws-sdk/client-s3");
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
       const mockAssignmentDoc = {
        toObject: () => ({
          _id: "a1",
          submissions: [
            { studentId: "studentId", score: 90 },
            { studentId: "otherId", score: 85 },
          ],
           }),
        submissions: [
          { studentId: "studentId", score: 90 },
          { studentId: "otherId",   score: 85 },
        ],
      };
      const mockAssignments = [ mockAssignmentDoc ];
      Assignment.find.mockResolvedValue(mockAssignments);

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

    it("returns filtered and mapped assignments for a student (using toObject)", async () => {
      // Arrange
      req.params.classId = "class1";
      req.user.authority = "student";
      req.user.id        = "stu1";
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);

      // Stub the classroom lookup
      Classroom.findOne.mockResolvedValue({ _id: "class1", students: ["stu1"] });

      // Create a fake Mongoose doc with .toObject()
      const assignmentDoc = {
        toObject: () => ({
          _id: "a1",
          submissions: [
            { studentId: "stu1", data: "A" },
            { studentId: "other", data: "B" },
          ],
        }),
        submissions: [
          { studentId: "stu1", data: "A" },
          { studentId: "other", data: "B" },
        ],
      };
      Assignment.find.mockResolvedValue([assignmentDoc]);

      // Act
      await getAssignments(req, res);

      // Assert: only the student’s own submission is returned, and the toObject fields are included
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        { _id: "a1", submissions: [{ studentId: "stu1", data: "A" }] },
      ]);
    });

    it("returns 500 if the database query throws", async () => {
      // Arrange
      req.params.id          = "class1";                          // controller uses req.params.id :contentReference[oaicite:0]{index=0}
      req.user.authority     = "teacher";
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      Classroom.findOne.mockResolvedValue({ _id: "class1", teachers: ["teacher1"] });

      // MOCK find() to return a “query” with sort() that rejects
      Assignment.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error("failure"))
      });

      // Act
      await getAssignments(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "failure" });
    });

    it("returns modifiedAssignments (filtered submissions) for a student in the class", async () => {
      // Arrange
      req.params.id = "validClassId";
      req.user.authority = "student";
      req.user.id = "stu123";
      // Always treat any string as a valid ObjectId for this test
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);

      // Mock Classroom.findOne so that the student is found in the class
      Classroom.findOne.mockResolvedValue({ _id: "validClassId", students: ["stu123"] });

      // Create a fake Mongoose document with .toObject() and .submissions array
      const fakeDoc = {
        toObject: () => ({
          _id: "a1",
          title: "HW1",
          submissions: [
            { studentId: "stu123", score: 100 },
            { studentId: "otherStu", score: 50 },
          ],
        }),
        submissions: [
          { studentId: "stu123", score: 100 },
          { studentId: "otherStu", score: 50 },
        ],
      };
      // Assignment.find(...).sort({ … }) returns a Promise that resolves to an array
      Assignment.find.mockImplementation(() => ({
        sort: jest.fn().mockResolvedValue([fakeDoc]),
      }));

      // Act
      await getAssignments(req, res);

      // Assert
      // We expect only the "stu123" submission to survive in the returned object array
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        {
          _id: "a1",
          title: "HW1",
          submissions: [{ studentId: "stu123", score: 100 }],
        },
      ]);
    });

    it("returns all assignments (unfiltered) for a teacher in the class", async () => {
      // Arrange
      req.params.id = "validClassId";
      req.user.authority = "teacher";
      req.user.id = "teach123";
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);

      // Mock Classroom.findOne so that the teacher is found in the class
      Classroom.findOne.mockResolvedValue({ _id: "validClassId", teachers: ["teach123"] });

      // Create a plain JS object (no .toObject()) since teachers get the raw array back
      const assignmentObj1 = {
        _id: "a1",
        title: "HW1",
        submissions: [
          { studentId: "stu1", score: 80 },
          { studentId: "stu2", score: 90 },
        ],
      };
      const assignmentObj2 = {
        _id: "a2",
        title: "HW2",
        submissions: [
          { studentId: "stuA", score: 70 },
        ],
      };

      // Mock Assignment.find().sort() to return a Promise that resolves to our array
      Assignment.find.mockImplementation(() => ({
        sort: jest.fn().mockResolvedValue([assignmentObj1, assignmentObj2]),
      }));

      // Act
      await getAssignments(req, res);

      // Assert
      // Since authority === "teacher", it should return the entire assignments array
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([assignmentObj1, assignmentObj2]);
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

    it("returns 201 and the new assignment on success", async () => {
      // Arrange
      req.user.authority = "teacher";
      req.user.id = "teacher1";
      req.body = {
        name: "Homework 1",
        description: "First assignment",
        classId: "class123",
        dueDate: "2025-06-01"
      };
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      // user is a teacher in that class
      Classroom.findOne.mockResolvedValue({ _id: "class123", teachers: ["teacher1"] });
      // stub out Assignment.create
      const fakeAssignment = {
        _id: "a1",
        name: "Homework 1",
        description: "First assignment",
        classId: "class123",
        dueDate: "2025-06-01",
        submissions: []
      };
      Assignment.create.mockResolvedValue(fakeAssignment);

      // Act
      await createAssignment(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(fakeAssignment);
   });

    it("returns 500 if Assignment.create throws", async () => {
      // Arrange
      req.user.authority = "teacher";
      req.user.id = "teacher1";
      req.body = {
        name: "Homework 2",
        description: "Second assignment",
        classId: "class123",
        dueDate: "2025-06-02"
      };
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      Classroom.findOne.mockResolvedValue({ _id: "class123", teachers: ["teacher1"] });
      // simulate a create error
      Assignment.create.mockRejectedValue(new Error("Creation failed"));

      // Act
      await createAssignment(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Creation failed" });
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

    it("deletes the assignment and returns 200 with a success message", async () => {
      // Arrange
      req.user.authority = "teacher";
      req.user.id        = "teacher1";
      req.params.id      = "validId";
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);

      // Stub the assignment lookup
      const mockAssignment = {
        _id: "validId",
        classId: "class123",
        submissions: [],      // no files to delete
      };
      Assignment.findById.mockResolvedValue(mockAssignment);

      // Stub classroom check
      Classroom.findOne.mockResolvedValue({
        _id: "class123",
        teachers: ["teacher1"],
      });

      // Stub the actual delete call
      Assignment.findByIdAndDelete = jest.fn().mockResolvedValue(mockAssignment);

      // Act
      await deleteAssignment(req, res);

      // Assert
      expect(Assignment.findByIdAndDelete).toHaveBeenCalledWith("validId");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Assignment and associated files deleted successfully",
      });
    });

    it("handles unexpected errors by returning 500 with the error message", async () => {
      // Arrange
      req.user.authority = "teacher";
      req.params.id      = "someId";
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);

      // Make findById throw
      Assignment.findById.mockRejectedValue(new Error("Something went wrong"));

      // Act
      await deleteAssignment(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Something went wrong" });
    });

    it("calls s3.deleteObject for submissions with pdfURL and deletes the assignment", async () => {
      // Arrange
      req.user.authority = "teacher";
      req.user.id = "u1";
      req.params.id = "a1";

      // Create an assignment with two submissions: one has a pdfURL, the other does not
      const mockAssignment = {
        _id: "a1",
        classId: "c1",
        submissions: [
          { pdfURL: "http://example.com/file1.pdf", pdfKey: "file1.pdf" },
          { pdfURL: null, pdfKey: "file2.pdf" }
        ],
      };

      // Stub Assignment.findById to return our mock
      Assignment.findById.mockResolvedValue(mockAssignment);
      // Stub Classroom.findOne so the user is authorized
      Classroom.findOne.mockResolvedValue({ _id: "c1", teachers: ["u1"] });
      // Spy on S3.prototype.deleteObject to simulate a successful deletion
      const deleteObjectSpy = jest
        .spyOn(S3.prototype, "deleteObject")
        .mockResolvedValue({}); // resolves without throwing
      // Stub the final deletion call
      Assignment.findByIdAndDelete = jest.fn().mockResolvedValue(mockAssignment);

      // Act
      await deleteAssignment(req, res);

      // Assert
      // - deleteObject should have been called exactly once (only the submission with pdfURL)
      expect(deleteObjectSpy).toHaveBeenCalledWith(
        expect.objectContaining({ Key: "file1.pdf" })
      );
      // - after deleting files, the assignment itself is deleted
      expect(Assignment.findByIdAndDelete).toHaveBeenCalledWith("a1");
      // - and a 200/JSON response is sent
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Assignment and associated files deleted successfully",
      });

      // Restore the spy so it doesn't bleed into other tests
      deleteObjectSpy.mockRestore();
    });

    it("handles s3.deleteObject errors by sending a 500 response", async () => {
      // Arrange
      req.user.authority = "teacher";
      req.user.id = "u1";
      req.params.id = "a1";

      // One submission that does have a pdfURL
      const mockAssignment = {
        _id: "a1",
        classId: "c1",
        submissions: [
          { pdfURL: "http://example.com/file1.pdf", pdfKey: "file1.pdf" }
        ],
      };

      Assignment.findById.mockResolvedValue(mockAssignment);
      Classroom.findOne.mockResolvedValue({ _id: "c1", teachers: ["u1"] });
      // Now mock deleteObject to reject, simulating an S3 error
      const deleteObjectSpy = jest
        .spyOn(S3.prototype, "deleteObject")
        .mockRejectedValue(new Error("AWS failure"));
      // We still stub findByIdAndDelete to avoid throwing further errors after the loop
      Assignment.findByIdAndDelete = jest.fn().mockResolvedValue(mockAssignment);

      // Act
      await deleteAssignment(req, res);

      // Assert
      // - deleteObject was called with the correct Key
      expect(deleteObjectSpy).toHaveBeenCalledWith(
        expect.objectContaining({ Key: "file1.pdf" })
      );
      // - because deleteObject threw, the controller should send a 500 error
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Error deleting file.");

      deleteObjectSpy.mockRestore();
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

    it("responds 200 with the updated assignment when findByIdAndUpdate succeeds", async () => {
      // Arrange
      req.user.authority = "teacher";
      req.params.id     = "validId";
      req.body          = { rubric: { pointValue: 50 } };
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);

      // Stub out the DB call to return an “updated” doc
      const updatedAssignment = { _id: "validId", rubric: req.body.rubric };
      Assignment.findByIdAndUpdate = jest
        .fn()
        .mockResolvedValue(updatedAssignment);

      // Act
      await updateAssignmentRubric(req, res);

      // Assert
      expect(Assignment.findByIdAndUpdate).toHaveBeenCalledWith(
        "validId",
        { $set: { rubric: req.body.rubric } },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedAssignment);
    });

    it("responds 500 with an error message if findByIdAndUpdate throws", async () => {
      // Arrange
      req.user.authority = "teacher";
      req.params.id     = "validId";
      req.body          = { rubric: { pointValue: 75 } };
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);

      // Simulate a DB error
      Assignment.findByIdAndUpdate = jest
        .fn()
        .mockRejectedValue(new Error("DB failure"));

      // Act
      await updateAssignmentRubric(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "DB failure" });
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

    it("returns 404 if no submission with that ID exists", async () => {
      // Arrange
      req.user.authority = "teacher";
      req.params.assignmentId = "a1";
      req.params.submissionId = "s1";
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);

      // Stub assignment.submissions.id to return null
      const mockAssignment = {
        _id: "a1",
        classId: "c1",
        submissions: { id: jest.fn().mockReturnValue(null) }
      };
      Assignment.findById.mockResolvedValue(mockAssignment);
      Classroom.findOne.mockResolvedValue({ _id: "c1", teachers: ["teacher"] });

      // Act
      await updateSubmission(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Submission not found" });
    });

    it("updates feedback and status when provided and returns the full assignment", async () => {
      // Arrange
      req.user.authority = "teacher";
      req.params.assignmentId = "a1";
      req.params.submissionId = "s1";
      req.body = { feedback: ["Well done"], status: "graded" };
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);

      // Create a fake submission subdoc with id()
      const subdoc = { _id: "s1", feedback: [], status: "pending" };
      const mockAssignment = {
        _id: "a1",
        classId: "c1",
        submissions: { id: jest.fn().mockReturnValue(subdoc) },
        save: jest.fn().mockResolvedValue(true)
      };
      Assignment.findById.mockResolvedValue(mockAssignment);
      Classroom.findOne.mockResolvedValue({ _id: "c1", teachers: ["teacher"] });

      // Act
      await updateSubmission(req, res);

      // Assert
      expect(subdoc.feedback).toEqual(req.body.feedback);
      expect(subdoc.status).toBe(req.body.status);
      expect(mockAssignment.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockAssignment);
    });

    it("returns 500 if saving the assignment throws", async () => {
      // Arrange
      req.user.authority = "teacher";
      req.params.assignmentId = "a1";
      req.params.submissionId = "s1";
      req.body = { feedback: ["Oops"], status: "error" };
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);

      const subdoc = { _id: "s1", feedback: [], status: "pending" };
      const mockAssignment = {
        _id: "a1",
        classId: "c1",
        submissions: { id: jest.fn().mockReturnValue(subdoc) },
        save: jest.fn().mockRejectedValue(new Error("save failed"))
      };
      Assignment.findById.mockResolvedValue(mockAssignment);
      Classroom.findOne.mockResolvedValue({ _id: "c1", teachers: ["teacher"] });

      // Act
      await updateSubmission(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "save failed" });
    });
  });

  describe('getSubmissions', () => {
    let req, res;

    beforeEach(() => {
      // reset mocks & build fresh req/res
      jest.clearAllMocks();
      req = {
        params: { id: 'someId' },
        user: { id: 'student123', authority: 'student' }
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn()
      };
    });

    it('returns 404 if the ID is invalid', async () => {
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false);

      await getSubmissions(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'No such Template and invalid ID'
      });
    });

    it('returns 404 when no assignment is found', async () => {
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      Assignment.findById.mockResolvedValue(null);

      await getSubmissions(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Assignment not found'
      });
    });

    it('filters submissions for a student user', async () => {
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);

      // Stub a Mongoose document with .toObject() and .submissions
      const fakeDoc = {
        toObject: () => ({
          _id: 'someId',
          submissions: [
            { studentId: 'student123', answer: 'A' },
            { studentId: 'other',       answer: 'B' }
          ]
        }),
        submissions: [
          { studentId: 'student123', answer: 'A' },
          { studentId: 'other',       answer: 'B' }
        ]
      };
      Assignment.findById.mockResolvedValue(fakeDoc);

      await getSubmissions(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        _id: 'someId',
        submissions: [{ studentId: 'student123', answer: 'A' }]
      });
    });

    it('returns the full assignment for a non-student (e.g. teacher)', async () => {
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      req.user.authority = 'teacher';

      const fakeDoc = { foo: 'bar' };  // anything, since we don’t call toObject() here
      Assignment.findById.mockResolvedValue(fakeDoc);

      await getSubmissions(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fakeDoc);
    });

    it('handles unexpected errors with a 500 response', async () => {
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      Assignment.findById.mockRejectedValue(new Error('db down'));

      await getSubmissions(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'db down' });
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

    it('handles a save error by returning 500', async () => {
      const existingSubmission = {
        _id: 'sub456',
        comments: []
      };
      fakeAssignment = {
        submissions: [ existingSubmission ],
        save: jest.fn().mockRejectedValue(new Error('save failed'))
      };
      Assignment.findById.mockResolvedValue(fakeAssignment);

      await createSubmissionComment(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'save failed' });
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

    it("returns 404 if submission not found (using submissions.id)", async () => {
      // Arrange
      req.body = { text: "Test comment" };
      // Use valid‐looking ObjectId strings so mongoose.Types.ObjectId.isValid(...) → true
      req.params.assignmentId = "507f1f77bcf86cd799439011";
      req.params.submissionId  = "507f191e810c19729de860ea";
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);

      // Build a fake assignment whose `submissions.id(...)` will return null
      const submissionsMock = { id: jest.fn().mockReturnValue(null) };
      const mockAssignment = {
        _id: req.params.assignmentId,
        submissions: submissionsMock,
      };
      Assignment.findById.mockResolvedValue(mockAssignment);

      // Act
      await createSubmissionComment(req, res);

      // Assert
      expect(submissionsMock.id).toHaveBeenCalledWith(req.params.submissionId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Submission not found" });
    });

    it("adds a new comment to an existing submission and returns the updated assignment", async () => {
      // Arrange
      req.body = { text: "Looks good!" };
      req.params.assignmentId = "507f1f77bcf86cd799439011";
      req.params.submissionId  = "507f191e810c19729de860ea";
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);

      // Create a fake submission with an initially empty comments array
      const submissionMock = { comments: [] };
      const submissionsMock = { id: jest.fn().mockReturnValue(submissionMock) };

      // Create a fake assignment object
      const assignmentMock = {
        _id: req.params.assignmentId,
        submissions: submissionsMock,
        save: jest.fn().mockResolvedValue(true),
      };

      // Stub Assignment.findById to return our fake assignment
      Assignment.findById.mockResolvedValue(assignmentMock);

      // Act
      await createSubmissionComment(req, res);

      // Assert
      // 1) submissions.id(...) was called with the right submissionId
      expect(submissionsMock.id).toHaveBeenCalledWith(req.params.submissionId);

      // 2) A new comment object was pushed onto submission.comments
      expect(submissionMock.comments.length).toBe(1);
      expect(submissionMock.comments[0]).toMatchObject({
        text: "Looks good!",
        // assuming controller also attaches user: req.user.id (if implemented),
        // you could check for that here. If not, at least check text is correct.
      });

      // 3) assignment.save() was called once
      expect(assignmentMock.save).toHaveBeenCalled();

      // 4) The response was a 200 with the entire assignment object
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(assignmentMock);
    });
  });
});