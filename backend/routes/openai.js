const express = require("express")
const router = express.Router()


const { 
  completion,
  test,
  extractText,
  trialtextex
} = require("../controllers/openaiController")


//login route

router.post("/completion", completion)

router.get("/test", test)

router.post("/extext", extractText)

router.get("/textex", trialtextex)

module.exports = router