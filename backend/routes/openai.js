const express = require("express")
const router = express.Router()


const { 
  completion,
  test
} = require("../controllers/openaiController")


//login route

router.post("/completion", completion)

router.get("/test", test)



module.exports = router