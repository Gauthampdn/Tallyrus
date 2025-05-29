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
