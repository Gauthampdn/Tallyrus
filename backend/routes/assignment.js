const express = require("express")
const router = express.Router()

const { 
  getAssignments,
  createAssignment,
  deleteAssignment,
  getSubmissions,
   // import the createSubmission function
} = require("../controllers/assignmentController")

const requireAuth = require("../middleware/requireAuth")

router.use(requireAuth) // requires authentication and then calls next. if no authentication then it throws an error

// GET all assignments for a class
router.get("/:id", getAssignments)

// Create a new assignment
router.post("/make", createAssignment)

// Delete an assignment
router.delete("/:id", deleteAssignment)


router.get("/submissions/:id", getSubmissions) // new route for submitting assignments

// In assignment router:





module.exports = router
