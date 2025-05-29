const mongoose = require("mongoose");
const User = require("../models/userModel");
const {
  logout,
  getGoogleUser,
  switchAuthority,
  getAllUsers,
} = require("../controllers/authController");

// Mock the User model
jest.mock("../models/userModel");

describe("authController", () => {
  let req, res;

  beforeEach(() => {
    jest.resetAllMocks();
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      clearCookie: jest.fn(),
      redirect: jest.fn(),
    };
  });

  describe("logout", () => {
    it("destroys session and redirects", () => {
      // Arrange: mock logout and session.destroy callbacks
      req.logout = jest.fn((cb) => cb());
      req.session = { destroy: jest.fn((cb) => cb()) };

      // Act
      logout(req, res);

      // Assert
      expect(req.logout).toHaveBeenCalled();
      expect(req.session.destroy).toHaveBeenCalled();
      expect(res.clearCookie).toHaveBeenCalledWith("connect.sid");
      expect(res.redirect).toHaveBeenCalledWith("https://tallyrus.com");
    });
  });

  describe("getGoogleUser", () => {
    it("returns user JSON when authenticated", async () => {
      req.isAuthenticated = jest.fn().mockReturnValue(true);
      req.user = { id: "u1", email: "test@example.com" };

      await getGoogleUser(req, res);

      expect(res.json).toHaveBeenCalledWith(req.user);
    });

    it("returns 401 when not authenticated", async () => {
      req.isAuthenticated = jest.fn().mockReturnValue(false);

      await getGoogleUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Unauthorized access since you are not logged in",
      });
    });
  });

  describe("switchAuthority", () => {
    it("toggles authority and returns updated user when authenticated", async () => {
      req.isAuthenticated = jest.fn().mockReturnValue(true);
      req.user = { _id: "u1" };

      const fakeUser = {
        _id: "u1",
        authority: "teacher",
        save: jest.fn().mockResolvedValue(),
      };
      User.findById.mockResolvedValue(fakeUser);

      await switchAuthority(req, res);

      expect(User.findById).toHaveBeenCalledWith("u1");
      expect(fakeUser.authority).toBe("student");
      expect(fakeUser.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(fakeUser);
    });

    it("returns 401 when not authenticated", async () => {
      req.isAuthenticated = jest.fn().mockReturnValue(false);

      await switchAuthority(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized access" });
    });

    it("returns 500 on error", async () => {
      req.isAuthenticated = jest.fn().mockReturnValue(true);
      req.user = { _id: "u1" };
      User.findById.mockRejectedValue(new Error("db error"));

      await switchAuthority(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "An error occurred while switching authority",
      });
    });
  });

  describe("getAllUsers", () => {
    beforeAll(() => {
      // Set allowed emails for tests
      process.env.ALLOWED_EMAILS = "a@x.com,b@y.com";
    });

    it("returns 401 when not authenticated", async () => {
      req.isAuthenticated = jest.fn().mockReturnValue(false);

      await getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized access" });
    });

    it("returns 403 when email not allowed", async () => {
      req.isAuthenticated = jest.fn().mockReturnValue(true);
      req.user = { email: "not@allowed.com" };
      User.find = jest.fn();

      await getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Forbidden: You are not authorized to access this resource",
      });
      expect(User.find).not.toHaveBeenCalled();
    });

    it("returns users array when authenticated and allowed", async () => {
      req.isAuthenticated = jest.fn().mockReturnValue(true);
      req.user = { email: "a@x.com" };

      const fakeUsers = [{ email: "a@x.com", numGraded: 5 }];
      const sortMock = jest.fn().mockResolvedValue(fakeUsers);
      User.find.mockReturnValue({ sort: sortMock });

      await getAllUsers(req, res);

      expect(User.find).toHaveBeenCalled();
      expect(sortMock).toHaveBeenCalledWith({ numGraded: -1 });
      expect(res.json).toHaveBeenCalledWith(fakeUsers);
    });

    it("returns 500 on exception", async () => {
      req.isAuthenticated = jest.fn().mockReturnValue(true);
      req.user = { email: "a@x.com" };
      User.find.mockImplementation(() => {
        throw new Error("fail");
      });

      await getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "An error occurred while fetching users",
      });
    });
  });
});
