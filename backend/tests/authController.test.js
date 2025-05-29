// Mock environment variables before requiring the controller
process.env.GOOGLE_CLIENT_ID = "test-client-id";
process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";

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
    it("returns 401 when not authenticated", async () => {
      req.isAuthenticated = jest.fn().mockReturnValue(false);

      await switchAuthority(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized access" });
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
  });
  
});
