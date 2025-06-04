// Mock environment variables before requiring the controller
process.env.GOOGLE_CLIENT_ID = "test-client-id";
process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";

const mongoose = require("mongoose");
const passport = require("passport");
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

  describe("GoogleStrategy verify callback", () => {
    let strategy;

    beforeAll(() => {
      // Grab the registered Google strategy
      strategy = passport._strategy("google");
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("returns the existing user when User.findOne finds one", async () => {
      const existingUser = { id: "123", email: "existing@example.com" };
      // Mock findOne to resolve to the existing user
      User.findOne.mockResolvedValue(existingUser);

      const done = jest.fn();
      const profile = {
        id: "123",
        email: "existing@example.com",
        picture: "pic-url",
        given_name: "Existing Name",
      };

      await strategy._verify({}, "access-token", "refresh-token", profile, done);

      expect(User.findOne).toHaveBeenCalledWith({ id: "123" });
      expect(done).toHaveBeenCalledWith(null, existingUser);
    });

    it("creates and returns a new user when User.findOne returns null", async () => {
      // findOne resolves to null → triggers new User(...) branch
      User.findOne.mockResolvedValue(null);

      // Mock the User constructor so that `new User(...)` gives us a fake doc whose save() works
      User.mockImplementation(function (data) {
        Object.assign(this, data);
        this.save = jest.fn().mockResolvedValue(this);
      });

      const done = jest.fn();
      const profile = {
        id: "456",
        email: "new@example.com",
        picture: "new-pic-url",
        given_name: "New Name",
      };

      await strategy._verify({}, "access-token", "refresh-token", profile, done);

      // Verify we tried to find the user by ID
      expect(User.findOne).toHaveBeenCalledWith({ id: "456" });

      // Verify constructor was called with the correct payload
      expect(User).toHaveBeenCalledWith({
        email: "new@example.com",
        id: "456",
        picture: "new-pic-url",
        name: "New Name",
        authority: "teacher",
        numGraded: 0,
      });

      // Grab the instance that was created
      const newUserInstance = User.mock.instances[0];

      // Ensure save() was invoked on that new instance
      expect(newUserInstance.save).toHaveBeenCalled();

      // Finally, done(null, newUserInstance)
      expect(done).toHaveBeenCalledWith(null, newUserInstance);
    });

    it("calls done with an error if User.findOne throws", async () => {
      const lookupError = new Error("database lookup failed");
      User.findOne.mockRejectedValue(lookupError);

      const done = jest.fn();
      const profile = { id: "789", email: "err@example.com", picture: "err-pic", given_name: "Err" };

      await strategy._verify({}, "access-token", "refresh-token", profile, done);

      expect(User.findOne).toHaveBeenCalledWith({ id: "789" });
      expect(done).toHaveBeenCalledWith(lookupError);
    });

    it("calls done with an error if saving the new user throws", async () => {
      User.findOne.mockResolvedValue(null);

      // Now mock save() to reject
      User.mockImplementation(function (data) {
        Object.assign(this, data);
        this.save = jest.fn().mockRejectedValue(new Error("save failed"));
      });

      const done = jest.fn();
      const profile = { id: "101", email: "savefail@example.com", picture: "pf-pic", given_name: "SaveFail" };

      await strategy._verify({}, "access-token", "refresh-token", profile, done);

      // We should have tried to create a new user
      expect(User.findOne).toHaveBeenCalledWith({ id: "101" });
      // And done should be called with the save error
      expect(done).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe("Passport serializeUser / deserializeUser", () => {
    it("should serialize the user by calling done(null, user._id)", () => {
      // Grab the serializer function that was registered in authController.js
      const serializer = passport._serializers[0];
      const done = jest.fn();
      const fakeUser = { _id: "serialized-id-123" };

      // Call the serializer with our fake user
      serializer(fakeUser, done);

      // Expect done to have been called with (null, <user._id>)
      expect(done).toHaveBeenCalledWith(null, "serialized-id-123");
    });

    it("should deserialize the user by looking up User.findById and calling done(null, user)", async () => {
      // Grab the deserializer function that was registered in authController.js
      const deserializer = passport._deserializers[0];
      const done = jest.fn();
      const fakeUserFromDb = { _id: "deserialized-id-456", name: "TestUser" };

      // Mock User.findById to resolve with our fake user
      User.findById = jest.fn().mockResolvedValue(fakeUserFromDb);

      // Invoke the deserializer with an ID string
      await deserializer("deserialized-id-456", done);

      // Verify that User.findById was called with the same ID
      expect(User.findById).toHaveBeenCalledWith("deserialized-id-456");

      // Verify done(null, user) was called
      expect(done).toHaveBeenCalledWith(null, fakeUserFromDb);
    });

    it("should call done(err) when User.findById throws an error", async () => {
      const deserializer = passport._deserializers[0];
      const lookupError = new Error("findById failed");
      const done = jest.fn();

      // Mock User.findById to reject
      User.findById = jest.fn().mockRejectedValue(lookupError);

      await deserializer("some-id", done);

      // It should still have called User.findById("some-id")
      expect(User.findById).toHaveBeenCalledWith("some-id");

      // And now done should have been called with the error
      expect(done).toHaveBeenCalledWith(lookupError);
    });
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

    it("returns req.user as JSON when authenticated", async () => {
      // 1. Simulate an authenticated request
      req.isAuthenticated = jest.fn().mockReturnValue(true);
      req.user = { email: "test@example.com", name: "Test User" };

      // 2. Call the controller
      await getGoogleUser(req, res);

      // 3. Since isAuthenticated() is true, it should log and then send back req.user
      expect(res.json).toHaveBeenCalledWith(req.user);
    });
  });

  describe("switchAuthority", () => {
    it("returns 401 when not authenticated", async () => {
      req.isAuthenticated = jest.fn().mockReturnValue(false);

      await switchAuthority(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized access" });
    });

    it("returns 500 when an error occurs while switching authority", async () => {
      // 1. Simulate an authenticated request
      req.isAuthenticated = jest.fn().mockReturnValue(true);
      req.user = { _id: "12345" };

      // 2. Mock User.findById to reject and trigger the catch block
      User.findById = jest.fn().mockRejectedValue(new Error("DB failure"));

      // 3. Call the controller
      await switchAuthority(req, res);

      // 4. Expect a 500 status and the specific error JSON
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "An error occurred while switching authority",
      });
    });

    it("toggles a teacher to student and returns the updated user", async () => {
      // 1. Simulate an authenticated request with a user ID
      req.isAuthenticated = jest.fn().mockReturnValue(true);
      req.user = { _id: "abc123" };

      // 2. Create a fake user document whose authority is "teacher"
      const fakeUser = {
        _id: "abc123",
        authority: "teacher",
        save: jest.fn().mockResolvedValue(true),
      };

      // 3. Mock User.findById to resolve to our fakeUser
      User.findById = jest.fn().mockResolvedValue(fakeUser);

      // 4. Call the controller
      await switchAuthority(req, res);

      // 5. After running, authority should have flipped to "student"
      expect(fakeUser.authority).toBe("student");
      // 6. And res.json should have been called with the updated user object
      expect(res.json).toHaveBeenCalledWith(fakeUser);
    });

    it("toggles a student to teacher and returns the updated user", async () => {
      // 1. Simulate an authenticated request with a user ID
      req.isAuthenticated = jest.fn().mockReturnValue(true);
      req.user = { _id: "xyz789" };

      // 2. Create a fake user document whose authority is "student"
      const fakeUser = {
        _id: "xyz789",
        authority: "student",
        save: jest.fn().mockResolvedValue(true),
      };

      // 3. Mock User.findById to resolve to our fakeUser
      User.findById = jest.fn().mockResolvedValue(fakeUser);

      // 4. Call the controller
      await switchAuthority(req, res);

      // 5. After running, authority should have flipped to "teacher"
      expect(fakeUser.authority).toBe("teacher");
      // 6. And res.json should have been called with the updated user object
      expect(res.json).toHaveBeenCalledWith(fakeUser);
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

    it("returns 500 when an error occurs while fetching users", async () => {
      // 1. Simulate authenticated user with an allowed email
      req.isAuthenticated = jest.fn().mockReturnValue(true);
      req.user = { email: "a@x.com" };

      // 2. Mock User.find().sort() to reject
      const sortMock = jest.fn().mockRejectedValue(new Error("DB failure"));
      User.find = jest.fn().mockReturnValue({ sort: sortMock });

      // 3. Call the controller
      await getAllUsers(req, res);

      // 4. Expect a 500 status and the appropriate JSON error
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "An error occurred while fetching users",
      });
    });

    it("returns users as JSON when authenticated and authorized", async () => {
      // 1. Simulate an authenticated user whose email is in ALLOWED_EMAILS
      req.isAuthenticated = jest.fn().mockReturnValue(true);
      req.user = { email: "a@x.com" };

      // 2. Prepare a fake users array and mock User.find().sort() to resolve to it
      const usersArray = [
        { email: "user1@example.com", numGraded: 5 },
        { email: "user2@example.com", numGraded: 3 },
      ];
      const sortMock = jest.fn().mockResolvedValue(usersArray);
      User.find = jest.fn().mockReturnValue({ sort: sortMock });

      // 3. Call the controller
      await getAllUsers(req, res);

      // 4. Verify that User.find was called and that sort was passed the correct argument
      expect(User.find).toHaveBeenCalled();
      expect(sortMock).toHaveBeenCalledWith({ numGraded: -1 });

      // 5. Expect res.json to be called with the mocked users array
      expect(res.json).toHaveBeenCalledWith(usersArray);
    });
  });
});
