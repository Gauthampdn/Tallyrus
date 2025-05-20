const mongoose = require("mongoose");
const Classroom = require("../models/classroomModel");
const Assignment = require("../models/assignmentModel");
const { S3 } = require("@aws-sdk/client-s3");

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
jest.mock("@aws-sdk/client-s3", () => ({
  S3: jest.fn(() => ({
    deleteObject: jest.fn().mockResolvedValue({}),
  })),
}));

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
    it("returns 200 & teacher's classes", async () => {
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

    it("returns 200 & student's classes (redacted fields)", async () => {
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

    it("should delete classroom if teacher", async () => {
      const req = {
        params: { id: "class1" },
        user: { id: "teacher1", authority: "teacher" },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      Classroom.findById.mockResolvedValue({
        _id: "class1",
        teachers: ["teacher1"],
      });
      Assignment.find.mockResolvedValue([]);
      Classroom.findByIdAndDelete.mockResolvedValue({});
      await deleteClassroom(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 403 if not teacher", async () => {
      const req = { params: { id: "class1" }, user: { authority: "student" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await deleteClassroom(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
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
