const express = require("express")
const router = express.Router()


const { 
  completion,
  test,
  extractText,
  gradeall,
  gradeSubmission, 
  parseRubricWithGPT4,
  potential,
  handleFunctionCall
} = require("../controllers/openaiController")


const requireAuth = require("../middleware/requireAuth")

router.post("/gradesubmission/:assignmentId", gradeSubmission);
router.post("/potential/:assignmentId", potential);
router.get("/gradeall/:id", gradeall);
router.get("/test", test);
router.get("/extract", extractText);

router.use(requireAuth) // requires authentication and then calls next. if no authentication then it throws an error

router.post('/function-call', requireAuth,  handleFunctionCall)


router.post("/completion", completion)

// Add this new route in openai.js



module.exports = router