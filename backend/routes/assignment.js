const express = require("express")
const router = express.Router()

const { 
  getAssignments, createAssignment
} = require("../controllers/assignmentController")

const requireAuth = require("../middleware/requireAuth")

router.use(requireAuth) // requires authentication and then calls next. if no authentication then it throws an error

// to GET all templates
router.get("/:id", getAssignments)

router.post("/make", createAssignment)



module.exports = router