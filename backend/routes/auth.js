const express = require("express")
const router = express.Router()


const { 
  getAuth,
  redirectGoogle,
  logout,
  getGoogleUser
} = require("../controllers/authController")


//login route

router.get("/", getAuth)

router.get("/redirect/google", redirectGoogle);

router.get("/logout", logout)  // logs out user by clearing cookies and then redirecting

router.get("/googleUser", getGoogleUser)  // returns the user object to save it in frontend



module.exports = router