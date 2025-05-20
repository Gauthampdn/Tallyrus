const mongoose = require("mongoose");
const { getAssignment } = require("../controllers/assignmentController");
const Assignment = require("../models/assignmentModel");

jest.mock("../models/assignmentModel");

describe("getAssignment controller", () => {
  let req, res;

  beforeEach(() => {
    req = { params: { id: "abc123" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    // default: treat every ID as valid
    jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("returns 404 if ID is invalid", async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(false);

    await getAssignment(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "No such Template and invalid ID",
    });
  });

  it("returns 404 if no assignment found", async () => {
    Assignment.findById.mockResolvedValue(null);

    await getAssignment(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Assignment not found" });
  });

  it("returns 200 and the assignment when found", async () => {
    const fake = { id: "abc123", name: "Test" };
    Assignment.findById.mockResolvedValue(fake);

    await getAssignment(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fake);
  });
});

describe("createAssignment", () => {
  it("should create assignment if user is teacher and classroom is valid", async () => {
    jest
      .spyOn(require("mongoose").Types.ObjectId, "isValid")
      .mockReturnValue(true);
    const req = {
      body: {
        name: "Test",
        description: "desc",
        classId: "507f1f77bcf86cd799439011",
        dueDate: "2024-06-01",
      },
      user: { id: "teacher1", authority: "teacher" },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const Classroom = require("../models/classroomModel");
    const Assignment = require("../models/assignmentModel");
    jest
      .spyOn(Classroom, "findOne")
      .mockResolvedValue({ _id: req.body.classId, teachers: [req.user.id] });
    jest.spyOn(Assignment, "create").mockResolvedValue({ name: "Test" });
    const { createAssignment } = require("../controllers/assignmentController");
    await createAssignment(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ name: "Test" });
  });
  it("should return 403 if user is not teacher", async () => {
    const req = {
      body: { classId: "507f1f77bcf86cd799439011" },
      user: { authority: "student" },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const { createAssignment } = require("../controllers/assignmentController");
    await createAssignment(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
