const User = require("../models/userModel");
const passport = require("passport");
var GoogleStrategy = require('passport-google-oauth2').Strategy;


require("dotenv").config();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:4000/auth/redirect/google", // somehow this is appending /undefined after ENV so i hardcoded it
  passReqToCallback: true
},



  async function (request, accessToken, refreshToken, profile, done) {
    try {
      console.log("trying to find user")

      // Find a user in the database based on their Google ID.
      let user = await User.findOne({ id: profile.id });

      // If the user doesn't exist, create a new one.
      if (!user) {
        console.log("trying to make user")

        const currentTime = new Date(); // Get the current time

        user = new User({
          email: profile.email,
          id: profile.id,
          picture: profile.picture,
          name: profile.given_name,
          surname: profile.lastname,
          authority: "student",
          numGraded: 0
        });
        await user.save();
        console.log("made new user")

      }

      // Return the user object for Passport to manage.
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));


passport.serializeUser(function (user, done) {
  // Serialize the user's ID into the session.
  done(null, user._id);
});

passport.deserializeUser(async function (id, done) {
  try {
    // Use the ID serialized into the session to fetch the user from the database.
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

const getAuth = passport.authenticate("google", { scope: ["email", "profile"] });

const redirectGoogle = passport.authenticate("google", {
  successRedirect: "http://localhost:3000/app",
  failureRedirect: "http://localhost:3000/login",
});

const logout = (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.redirect('http://localhost:3000/login');
    });
  });
}

const getGoogleUser = async (req, res) => {
  if (req.isAuthenticated()) {
    console.log("req is authenticated")
    res.json(req.user);
  }
  else {
    console.log("user not authenticated" + req.user)
    res.status(401).json({ error: "Unauthorized access since you are not logged in" });
  }
}

const switchAuthority = async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const user = await User.findById(req.user._id);
      user.authority = user.authority === "teacher" ? "student" : "teacher";
      await user.save();
      res.json( user );
    } catch (err) {
      res.status(500).json({ error: "An error occurred while switching authority" });
    }
  } else {
    res.status(401).json({ error: "Unauthorized access" });
  }
};

const getAllUsers = async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      // Retrieve the allowed emails from the environment variable and split them into an array
      const allowedEmails = process.env.ALLOWED_EMAILS.split(',');

      // Check if the authenticated user's email is in the allowed list
      if (!allowedEmails.includes(req.user.email)) {
        res.status(403).json({ error: "Forbidden: You are not authorized to access this resource" });
      }

      // Fetch all users and sort them in descending order based on numGraded
      const users = await User.find().sort({ numGraded: -1 });

      // Return the users as a JSON response
      res.json(users);
    } catch (err) {
      // If an error occurs, respond with a status 500 and an error message
      res.status(500).json({ error: "An error occurred while fetching users" });
    }
  } else {
    // If the user is not authenticated, respond with a status 401
    res.status(401).json({ error: "Unauthorized access" });
  }
};


module.exports = {
  getAuth,
  redirectGoogle,
  logout,
  getGoogleUser,
  switchAuthority,
  getAllUsers
}
