const mongoose = require("mongoose");
const Classroom = require("../models/classroomModel");
const User = require("../models/userModel");
const Assignment = require("../models/assignmentModel");



const aws = require('aws-sdk');
const {
  S3
} = require('@aws-sdk/client-s3');

const multer = require('multer');
const multerS3 = require('multer-s3');

require('dotenv').config();

// JS SDK v3 does not support global configuration.
// Codemod has attempted to pass values to each service client in this file.
// You may need to update clients outside of this file, if they use global config.
aws.config.update({
  secretAccessKey: process.env.AWSS3_SECRETKEY,
  accessKeyId: process.env.AWSS3_ACCESSKEY,
  region: process.env.AWSS3_BUCKETREGION
});

const BUCKET = process.env.AWSS3_BUCKETNAME;

const s3 = new S3({
  credentials: {
    secretAccessKey: process.env.AWSS3_SECRETKEY,
    accessKeyId: process.env.AWSS3_ACCESSKEY
  },

  region: process.env.AWSS3_BUCKETREGION
});

//-----------------------------------------------------------------------------------------------------------------------


// Get all classrooms for a user
const getClassroomsForUser = async (req, res) => {
  try {
    const user_id = req.user._id;
    console.log("Fetching classrooms for user:", user_id);

    let classrooms;

    if (req.user.authority === 'teacher') {
      classrooms = await Classroom.find({ teachers: user_id }).sort({ updatedAt: -1 });
    } else if (req.user.authority === 'student') {
      classrooms = await Classroom.find({ students: user_id }, {students: 0, teachers: 0, assignments: 0}).sort({ updatedAt: -1 });
    } else {
      return res.status(400).json({ error: "Invalid user authority" });
    }

    console.log("Found classrooms:", classrooms);
    res.status(200).json(classrooms);
  } catch (error) {
    console.error("Error in getClassroomsForUser:", error);
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
    for (let i = 0; i < 7; i++) {
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

  const colors = [
    "bg-red-800",    // A deep red that contrasts well with dark mode
    "bg-green-800",  // A dark green that fits the theme
    "bg-blue-800",   // A deep blue that blends nicely with dark mode
    "bg-yellow-800", // A darker yellow that is not too bright
    "bg-purple-800"  // A deep purple that works well in dark mode
  ];
    const getRandomColor = () => {
    return colors[Math.floor(Math.random() * colors.length)];
  };

  try {
    const joincode = await getUniqueJoinCode();
    const color = getRandomColor();


    const classroom = await Classroom.create({
      title,
      description,
      joincode,
      teachers: [user_id], // Add the creating teacher to the teachers array
      students: [], // Initialize with an empty students array
      assignments: [], // Initialize with an empty assignments array
      color
    });

    res.status(201).json(classroom);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};







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






const deleteClassroom = async (req, res) => {
  const classroomId = req.params.id; // ID of the classroom to be deleted
  const user_id = req.user._id; // Changed from req.user.id to req.user._id

  console.log("Trying to delete classroom", classroomId);
  console.log("User ID:", user_id);

  // Check if the user is a teacher
  if (req.user.authority !== "teacher") {
    return res.status(403).json({ error: "Only teachers can delete classrooms" });
  }

  try {
    // Find the classroom
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ error: "Classroom not found" });
    }

    // Check if the user is a teacher in the classroom
    console.log("Classroom teachers:", classroom.teachers);
    console.log("User ID to check:", user_id);
    if (!classroom.teachers.includes(user_id.toString())) {
      return res.status(403).json({ error: "Not authorized to delete this classroom" });
    }

    // Find and delete all assignments associated with the classroom
    const assignments = await Assignment.find({ classId: classroomId });
    for (const assignment of assignments) {
      // Delete associated files from S3 for each assignment
      for (const submission of assignment.submissions) {
        if (submission.pdfURL) {
          const filename = submission.pdfKey;
          console.log("Deleting file:", filename);
          try {
            await s3.deleteObject({ Bucket: BUCKET, Key: filename })
          } catch (error) {
            console.error("Error deleting file:", error);
            // Continue with deletion even if file deletion fails
          }
          console.log("Deleted file:", filename);
        }
      }
      // Delete the assignment
      await Assignment.findByIdAndDelete(assignment._id);
      console.log("Deleted assignment:", assignment._id);
    }

    // Delete the classroom
    await Classroom.findByIdAndDelete(classroomId);
    console.log("Deleted classroom:", classroomId);

    res.status(200).json({ message: "Classroom and associated assignments deleted successfully" });
  } catch (error) {
    console.error("Error deleting classroom:", error);
    res.status(500).json({ error: error.message });
  }
};
  






// Add a student to a classroom by join code
const joinClassroomByCode = async (req, res) => {
  console.log("joining");
  const { joinCode } = req.body;
  const student_id = req.user.id;

  if (req.user.authority !== "student") {
    return res.status(403).json({ error: "Only students can join classrooms" });
  }

  try {
    const classroom = await Classroom.findOne({ joincode: joinCode });

    if (!classroom) {
      return res.status(404).json({ error: "Classroom not found with provided join code" });
    }

    // Check if student is already in the classroom
    if (classroom.students.includes(student_id)) {
      return res.status(400).json({ error: "Student already in the classroom" });
    }

    // Add student to the classroom
    classroom.students.push(student_id);
    await classroom.save();

    res.status(200).json({ message: "Joined classroom successfully", classroom });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getClassroomsForUser,
  getClassroom,
  createClassroom,
  updateClassroom,
  deleteClassroom,
  joinClassroomByCode
};
