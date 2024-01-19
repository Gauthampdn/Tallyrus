const express = require("express")
const router = express.Router()


const { 
  completion,
  test,
  extractText,
  gradeall
} = require("../controllers/openaiController")


//login route

router.post("/completion", completion)

router.get("/test", test)

router.post("/extext", extractText)

router.get("/gradeall/:id", gradeall)


module.exports = router