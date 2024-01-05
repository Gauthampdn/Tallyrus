const express = require("express")
const router = express.Router()

const { 
  getAssignments,
  createAssignment,
  deleteAssignment,
  createSubmission // import the createSubmission function
} = require("../controllers/assignmentController")

const requireAuth = require("../middleware/requireAuth")

router.use(requireAuth) // requires authentication and then calls next. if no authentication then it throws an error

// GET all assignments for a class
router.get("/:id", getAssignments)

// Create a new assignment
router.post("/make", createAssignment)

// Delete an assignment
router.delete("/:id", deleteAssignment)

// Submit an assignment - assuming ":id" is the assignment ID
router.post("/submit/:id", createSubmission) // new route for submitting assignments

module.exports = router
