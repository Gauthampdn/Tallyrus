const express = require("express")
const router = express.Router()


const { 
  completion,
  test,
  extractText,
  gradeall,
  gradeSubmission
} = require("../controllers/openaiController")


//login route

router.post("/completion", completion)

router.get("/test", test)

router.post("/extext", extractText)

router.get("/gradeall/:id", gradeall)

// Add this new route in openai.js
router.post("/gradesubmission/:assignmentId", gradeSubmission);



module.exports = router