const mongoose = require("mongoose");
const Classroom = require("../models/classroomModel");
const Assignment = require("../models/assignmentModel");
const { S3 } = require("@aws-sdk/client-s3");

jest.mock("@aws-sdk/client-s3", () => ({
  S3: jest.fn(() => ({
    deleteObject: jest.fn().mockResolvedValue({}),
  })),
}));

const {
  getClassroomsForUser,
  getClassroom,
  createClassroom,
  updateClassroom,
  deleteClassroom,
  joinClassroomByCode,
} = require("../controllers/classroomController");

// ---- Mock out all external dependencies ----
jest.mock("../models/classroomModel");
jest.mock("../models/assignmentModel");

describe("classroomController", () => {
  let req, res;

  beforeEach(() => {
    // reset everything before each test
    jest.resetAllMocks();
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  // ---- getClassroomsForUser ----
  describe("getClassroomsForUser", () => {
    it("returns 200 & teacher’s classes", async () => {
      req = { user: { id: "u1", authority: "teacher" } };
      const fake = [{ id: "c1" }];
      const sortMock = jest.fn().mockResolvedValue(fake);
      Classroom.find.mockReturnValue({ sort: sortMock });

      await getClassroomsForUser(req, res);

      expect(Classroom.find).toHaveBeenCalledWith({ teachers: "u1" });
      expect(sortMock).toHaveBeenCalledWith({ updatedAt: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fake);
    });

    it("returns 200 & student’s classes (redacted fields)", async () => {
      req = { user: { id: "u2", authority: "student" } };
      const fake = [{ id: "c2" }];
      const projection = { students: 0, teachers: 0, assignments: 0 };
      const sortMock = jest.fn().mockResolvedValue(fake);
      Classroom.find.mockReturnValue({ sort: sortMock });

      await getClassroomsForUser(req, res);

      expect(Classroom.find).toHaveBeenCalledWith(
        { students: "u2" },
        projection
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fake);
    });

    it("returns 400 on invalid authority", async () => {
      req = { user: { authority: "other" } };
      await getClassroomsForUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid user authority",
      });
    });

    it("returns 400 on exception", async () => {
      req = { user: { id: "u1", authority: "teacher" } };
      Classroom.find.mockImplementation(() => {
        throw new Error("boom");
      });
      await getClassroomsForUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "boom" });
    });
  });

  // ---- getClassroom ----
  describe("getClassroom", () => {
    beforeEach(() => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
    });

    it("404s on invalid ID", async () => {
      req = { params: { id: "bad" }, user: {} };
      mongoose.Types.ObjectId.isValid.mockReturnValue(false);

      await getClassroom(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid ID" });
    });

    it("404s when not found", async () => {
      req = { params: { id: "cid1" } };
      Classroom.findById.mockResolvedValue(null);

      await getClassroom(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Classroom not found" });
    });

    it("200s with the classroom", async () => {
      const fake = { id: "cid1", title: "Test class" };
      req = { params: { id: "cid1" } };
      Classroom.findById.mockResolvedValue(fake);

      await getClassroom(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fake);
    });
  });

  // ---- createClassroom ----
  describe("createClassroom", () => {
    beforeEach(() => {
      req = {
        user: { id: "t1", authority: "teacher" },
        body: { title: "New", description: "Desc" },
      };
    });

    it("403s if non-teacher", async () => {
      req.user.authority = "student";
      await createClassroom(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Only teachers can create classrooms",
      });
    });

    it("201s and returns new classroom", async () => {
      // ensure join code is unique
      Classroom.findOne.mockResolvedValue(null);
      const fake = { id: "cls1", title: "New" };
      Classroom.create.mockResolvedValue(fake);

      await createClassroom(req, res);

      expect(Classroom.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "New",
          description: "Desc",
          teachers: ["t1"],
        })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(fake);
    });

    it("400s on error", async () => {
      Classroom.findOne.mockRejectedValue(new Error("db fail"));
      await createClassroom(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "db fail" });
    });
  });

  // ---- updateClassroom ----
  describe("updateClassroom", () => {
    beforeEach(() => {
      req = { params: { id: "cid" }, body: { title: "X" } };
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
    });

    it("404s on invalid ID", async () => {
      mongoose.Types.ObjectId.isValid.mockReturnValue(false);
      await updateClassroom(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid ID" });
    });

    it("404s when no classroom", async () => {
      Classroom.findByIdAndUpdate.mockResolvedValue(null);
      await updateClassroom(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Classroom not found" });
    });

    it("200s with updated classroom", async () => {
      const fake = { id: "cid", title: "X" };
      Classroom.findByIdAndUpdate.mockResolvedValue(fake);
      await updateClassroom(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fake);
    });

    it("400s on error", async () => {
      Classroom.findByIdAndUpdate.mockRejectedValue(new Error("fail"));
      await updateClassroom(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "fail" });
    });
  });

  // ---- deleteClassroom ----
  describe("deleteClassroom", () => {
    beforeEach(() => {
      req = {
        params: { id: "cls1" },
        user: { id: "t1", authority: "teacher" },
      };
      // default: found & teacher included
      Classroom.findById.mockResolvedValue({ teachers: ["t1"] });
      Assignment.find.mockResolvedValue([]); // no assignments
      Classroom.findByIdAndDelete.mockResolvedValue({});
    });

    it("403s if non-teacher", async () => {
      req.user.authority = "student";
      await deleteClassroom(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Only teachers can delete classrooms",
      });
    });

    it("404s when not found", async () => {
      Classroom.findById.mockResolvedValue(null);
      await deleteClassroom(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Classroom not found" });
    });

    it("403s if teacher not in class", async () => {
      Classroom.findById.mockResolvedValue({ teachers: ["other"] });
      await deleteClassroom(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Not authorized to delete this classroom",
      });
    });

    it("200s when successful", async () => {
      await deleteClassroom(req, res);
      expect(Assignment.find).toHaveBeenCalledWith({ classId: "cls1" });
      expect(Classroom.findByIdAndDelete).toHaveBeenCalledWith("cls1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Classroom and associated assignments deleted successfully",
      });
    });

    it("500s on exception", async () => {
      Classroom.findById.mockImplementation(() => {
        throw new Error("boom");
      });
      await deleteClassroom(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "boom" });
    });

    it("calls Assignment.findByIdAndDelete and logs the deleted assignment ID", async () => {
      // 1) Stub Assignment.find to return a single fake assignment
      const fakeAssignment = { _id: "assign123", submissions: [
        {
          pdfURL: "https://example.com/any.pdf",
          pdfKey: "any.pdf",
        },
      ] };
      Assignment.find.mockResolvedValue([fakeAssignment]);

      // 2) Stub S3.deleteObject to resolve (so no error path)
      const s3Instance = S3.mock.instances[0];
      s3Instance.deleteObject.mockResolvedValue({});

      // 3) Spy on console.log
      const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

      // 4) Call deleteClassroom
      await deleteClassroom(req, res);

      // 5) Expect that Assignment.findByIdAndDelete was called with the correct ID
      expect(Assignment.findByIdAndDelete).toHaveBeenCalledWith("assign123");

      // 6) Expect that console.log printed "Deleted assignment: assign123"
      expect(logSpy).toHaveBeenCalledWith("Deleted assignment:", "assign123");

      // 7) Cleanup the spy
      logSpy.mockRestore();
    });

    it("calls s3.deleteObject for every submission with pdfURL and deletes each assignment", async () => {
      // 1) Arrange: override Assignment.find to return our fake assignments
      const fakeAssignments = [
        {
          _id: "assign1",
          submissions: [
            { pdfURL: "https://.../fileA.pdf", pdfKey: "fileA.pdf" },
            { pdfURL: null }
          ]
        },
        {
          _id: "assign2",
          submissions: [
            { pdfURL: "https://.../fileB.pdf", pdfKey: "fileB.pdf" }
          ]
        }
      ];
      Assignment.find.mockResolvedValue(fakeAssignments);

      // 2) Spy on S3.deleteObject (the mock from jest.mock above)
      const deleteObjectSpy = S3().deleteObject;
      // Make sure deleteObject resolves (it already does via mockResolvedValue)

      // Also spy on Assignment.findByIdAndDelete
      const deleteAssignmentSpy = jest.spyOn(Assignment, "findByIdAndDelete")
        .mockResolvedValue({});

      // 3) Act: call the controller
      await deleteClassroom(req, res);

      // 4) Assert:
      // - s3.deleteObject was called exactly for each truthy pdfURL
      expect(deleteObjectSpy).toHaveBeenCalledTimes(2);
      expect(deleteObjectSpy).toHaveBeenCalledWith({
        Bucket: process.env.AWSS3_BUCKETNAME,
        Key: "fileA.pdf"
      });
      expect(deleteObjectSpy).toHaveBeenCalledWith({
        Bucket: process.env.AWSS3_BUCKETNAME,
        Key: "fileB.pdf"
      });

      // - Assignment.findByIdAndDelete was called for each assignment._id
      expect(deleteAssignmentSpy).toHaveBeenCalledWith("assign1");
      expect(deleteAssignmentSpy).toHaveBeenCalledWith("assign2");

      // - Finally, the classroom itself is deleted, and a 200 response is sent:
      expect(Classroom.findByIdAndDelete).toHaveBeenCalledWith("cls1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Classroom and associated assignments deleted successfully"
      });
    });

    it("returns 500 if s3.deleteObject throws an error", async () => {
      // 1) Arrange: one assignment with a single submission that has pdfURL
      const fakeAssignments = [
        {
          _id: "assignX",
          submissions: [
            { pdfURL: "https://.../bad.pdf", pdfKey: "bad.pdf" }
          ]
        }
      ];
      Assignment.find.mockResolvedValue(fakeAssignments);

      // 2) Make s3.deleteObject reject
      const error = new Error("S3 failure");
      const deleteObjectSpy = S3().deleteObject.mockRejectedValueOnce(error);

      // 3) Act
      await deleteClassroom(req, res);

      // 4) Assert:
      expect(deleteObjectSpy).toHaveBeenCalledWith({
        Bucket: process.env.AWSS3_BUCKETNAME,
        Key: "bad.pdf"
      });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error in Deleting file" });

      // Also ensure we did NOT call Assignment.findByIdAndDelete for that assignment,
      // because the controller bails out early on error.
      expect(Assignment.findByIdAndDelete).not.toHaveBeenCalledWith("assignX");
    });

    it("skips s3.deleteObject when submission.pdfURL is falsy", async () => {
      // Arrange: one assignment whose submission.pdfURL is null
      const fakeAssignments = [
        {
          _id: "assignNoPdf",
          submissions: [
            { pdfURL: null, pdfKey: "irrelevant.pdf" }
          ]
        }
      ];
      Assignment.find.mockResolvedValue(fakeAssignments);

      // We know s3.deleteObject is mocked to resolve by default
      const deleteObjectSpy = S3().deleteObject;

      // Act
      await deleteClassroom(req, res);

      // Assert:
      expect(deleteObjectSpy).not.toHaveBeenCalled();
      expect(Assignment.findByIdAndDelete).toHaveBeenCalledWith("assignNoPdf");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Classroom and associated assignments deleted successfully"
      });
    });
  });

  // ---- joinClassroomByCode ----
  describe("joinClassroomByCode", () => {
    beforeEach(() => {
      req = {
        user: { id: "s1", authority: "student" },
        body: { joinCode: "CODE1" },
      };
    });

    it("403s if non-student", async () => {
      req.user.authority = "teacher";
      await joinClassroomByCode(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Only students can join classrooms",
      });
    });

    it("404s when code not found", async () => {
      Classroom.findOne.mockResolvedValue(null);
      await joinClassroomByCode(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Classroom not found with provided join code",
      });
    });

    it("400s if already joined", async () => {
      const fake = { students: ["s1"], save: jest.fn() };
      Classroom.findOne.mockResolvedValue(fake);
      await joinClassroomByCode(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Student already in the classroom",
      });
    });

    it("200s and saves on success", async () => {
      const fake = { students: [], save: jest.fn().mockResolvedValue() };
      Classroom.findOne.mockResolvedValue(fake);
      await joinClassroomByCode(req, res);
      expect(fake.students).toContain("s1");
      expect(fake.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Joined classroom successfully",
        classroom: fake,
      });
    });

    it("400s on exception", async () => {
      Classroom.findOne.mockRejectedValue(new Error("oops"));
      await joinClassroomByCode(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "oops" });
    });
  });
});
