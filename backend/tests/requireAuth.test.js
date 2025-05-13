const requireAuth = require("../middleware/requireAuth");

describe("requireAuth middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req  = { isAuthenticated: jest.fn(), user: { id: "u1" } };
    res  = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("calls next() when req.isAuthenticated() is true", async () => {
    req.isAuthenticated.mockReturnValue(true);

    await requireAuth(req, res, next);

    expect(req.isAuthenticated).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("returns 401 when req.isAuthenticated() is false", async () => {
    req.isAuthenticated.mockReturnValue(false);

    await requireAuth(req, res, next);

    expect(req.isAuthenticated).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unauthorized access since you are not logged in"
    });
  });
});
