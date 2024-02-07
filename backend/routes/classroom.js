const express = require("express")
const router = express.Router()

const { 
  getClassroomsForUser,
  createClassroom,
  joinClassroomByCode,
  deleteClassroom
} = require("../controllers/classroomController")

const requireAuth = require("../middleware/requireAuth")

router.use(requireAuth) // requires authentication and then calls next. if no authentication then it throws an error

// to GET all classrooms
router.get("/", getClassroomsForUser)

router.post("/createclass", createClassroom)

router.patch("/join", joinClassroomByCode);

router.delete("/:id", deleteClassroom)



module.exports = router