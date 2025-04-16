const express = require("express")
const router = express.Router()


const { 
  completion,
  test,
  extractText,
  gradeall,
  gradeSubmission, 
  parseRubricWithGPT4,
} = require("../controllers/openaiController")

// router.get("/test-langsmith", testLangSmith);
const requireAuth = require("../middleware/requireAuth")

router.post("/gradesubmission/:assignmentId", gradeSubmission);


router.use(requireAuth) // requires authentication and then calls next. if no authentication then it throws an error

router.post("/completion", completion)

router.get("/test", test)



router.post("/extext", extractText)

router.get("/gradeall/:id", gradeall)

// Add this new route in openai.js



module.exports = router