const mongoose = require("mongoose");
const Classroom = require("../models/classroomModel");
const User = require("../models/userModel");

// Get all classrooms for a user
const getClassroomsForUser = async (req, res) => {
  try {
    const user_id = req.user.id;

    // First, determine the user's authority (teacher or student)

    let classrooms;

    if (req.user.authority === 'teacher') {
      classrooms = await Classroom.find({ teachers: user_id }).sort({ updatedAt: -1 });
    } else if (req.user.authority === 'student') {
      classrooms = await Classroom.find({ students: user_id }, {students: 0, teachers: 0, assignments: 0}).sort({ updatedAt: -1 });
    } else {
      return res.status(400).json({ error: "Invalid user authority" });
    }

    res.status(200).json(classrooms);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get a single classroom by ID
const getClassroom = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid ID" });
  }

  const classroom = await Classroom.findById(id);

  if (!classroom) {
    return res.status(404).json({ error: "Classroom not found" });
  }

  res.status(200).json(classroom);
};

// Create a new classroom

const createClassroom = async (req, res) => {
  const { title, description } = req.body;
  const user_id = req.user.id;

  // Check if the user has teacher authority
  if (req.user.authority !== "teacher") {
    return res.status(403).json({ error: "Only teachers can create classrooms" });
  }

  // Function to generate a random 5-character join code
  const generateJoinCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  // Function to check for uniqueness of join code
  const getUniqueJoinCode = async () => {
    let joincode;
    let isUnique = false;
    while (!isUnique) {
      joincode = generateJoinCode();
      const existingClassroom = await Classroom.findOne({ joincode });
      if (!existingClassroom) {
        isUnique = true;
      }
    }
    return joincode;
  };

  try {
    const joincode = await getUniqueJoinCode();

    const classroom = await Classroom.create({
      title,
      description,
      joincode,
      teachers: [user_id], // Add the creating teacher to the teachers array
      students: [], // Initialize with an empty students array
      assignments: [] // Initialize with an empty assignments array
    });

    res.status(201).json(classroom);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a classroom
const updateClassroom = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid ID" });
  }

  try {
    const classroom = await Classroom.findByIdAndUpdate(id, req.body, { new: true });

    if (!classroom) {
      return res.status(404).json({ error: "Classroom not found" });
    }

    res.status(200).json(classroom);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a classroom
const deleteClassroom = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid ID" });
  }

  const classroom = await Classroom.findByIdAndDelete(id);

  if (!classroom) {
    return res.status(404).json({ error: "Classroom not found" });
  }

  res.status(200).json({ message: "Classroom deleted" });
};

module.exports = {
  getClassroomsForUser,
  getClassroom,
  createClassroom,
  updateClassroom,
  deleteClassroom
};
