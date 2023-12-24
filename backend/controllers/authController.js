const User = require("../models/userModel");
const Template = require("../models/templateModel"); // Adjust the path if needed
const passport = require("passport");
var GoogleStrategy = require('passport-google-oauth2').Strategy;
const defaultTemplates = require('./DefaultTemplates');


require("dotenv").config();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "https://bcknd.pergi.app/auth/redirect/google", // somehow this is appending /undefined after ENV so i hardcoded it
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

        for (let templateData of defaultTemplates) {
          await Template.create({
            ...templateData,
            user_id: profile.id,
            createdAt: currentTime, // Set the createdAt to the current time
            updatedAt: currentTime  // Set the updatedAt to the current time
          });
        }
        user = new User({
          email: profile.email,
          id: profile.id,
          picture: profile.picture,
          name: profile.given_name
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
  successRedirect: "https://pergi.app",
  failureRedirect: "/failedAuth",
});

const logout = (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.redirect('https://pergi.app/about');
    });
  });
}

const getGoogleUser = async (req, res) => {
  if (req.isAuthenticated()) {
    console.log("req is authenticated")
    res.json(req.user);
  }
}

module.exports = {
  getAuth,
  redirectGoogle,
  logout,
  getGoogleUser
}
