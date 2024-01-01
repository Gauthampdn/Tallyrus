const mongoose = require("mongoose");
const Classroom = require("../models/classroomModel");
const User = require("../models/userModel");
const Assignment = require("../models/assignmentModel");

const getAssignments = async (req, res) => {  // returns all the assignments in a class when you /assignments/CLASSID if you are in the class
  const classId = req.params.id;
  const user_id = req.user.id;


  // Validate classId
  if (!mongoose.Types.ObjectId.isValid(classId)) {
    return res.status(400).json({ error: "Invalid classroom ID" });
  }

  try {
    // Check if a classroom with the given classId exists and the user is a student in it

    const classroom = await Classroom.findOne({ _id: classId, students: user_id });
    if (!classroom) {
      return res.status(400).json({ error: "You are not in this class" });
    }


    // Find all assignments for the classroom

    const assignments = await Assignment.find({ classId: classId });

    if (req.user.authority === 'student') {
      const modifiedAssignments = assignments.map(assignment => {
        return {
          ...assignment.toObject(), // Convert the assignment to a plain object
          submissions: assignment.submissions.filter(sub => sub.studentId === user_id) // Filter submissions to only include the user's
        };
      });

      return res.status(200).json(modifiedAssignments);
    }

    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



const createAssignment = async (req, res) => {
  const { rubric, name, description, classId, dueDate } = req.body;
  const user_id = req.user.id;

  // Check user's authority
  if (req.user.authority !== "teacher") {
    return res.status(403).json({ error: "Only teachers can create assignments" });
  }

  // Validate classId
  if (!mongoose.Types.ObjectId.isValid(classId)) {
    return res.status(400).json({ error: "Invalid classroom ID" });
  }

  try {
    // Check if the user is a teacher in the specified classroom
    const classroom = await Classroom.findOne({ _id: classId, teachers: user_id });
    if (!classroom) {
      return res.status(400).json({ error: "Not authorized to create assignments in this class" });
    }

    // Create a new assignment
    const assignment = await Assignment.create({
      rubric,
      name,
      description,
      classId,
      dueDate,
      submissions: [] // Initialize submissions as an empty array
    });

    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



module.exports = {
  getAssignments,
  createAssignment
};
