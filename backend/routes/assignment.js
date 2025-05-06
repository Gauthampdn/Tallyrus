const express = require("express")
const router = express.Router()

const {
  getAssignment,
  getAssignments,
  createAssignment,
  deleteAssignment,
  getSubmissions,
  updateAssignmentRubric,
  updateSubmission,
  createSubmissionComment
} = require("../controllers/assignmentController")

const requireAuth = require("../middleware/requireAuth")

// GET an assignment of a specific ID
router.get("/single/:id", getAssignment)

router.use(requireAuth) // requires authentication and then calls next. if no authentication then it throws an error

// GET all assignments for a class
router.get("/:id", getAssignments)

// Create a new assignment
router.post("/make", createAssignment)

// Delete an assignment
router.delete("/:id", deleteAssignment)

router.get("/submissions/:id", getSubmissions) // new route for submitting assignments

router.patch('/:assignmentId/submissions/:submissionId', updateSubmission);

// Add comment to a submission
router.post('/:assignmentId/submissions/:submissionId/comments', createSubmissionComment);

router.patch("/:id", updateAssignmentRubric)


// In assignment router:



module.exports = router
