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

const generateJoinCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 7; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
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

const getAssignment = async (req, res) => {

  const assignmentId = req.params.id;


  if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
    return res.status(404).json({ error: "No such Template and invalid ID" });
  }

  const assignment = await Assignment.findById(assignmentId);


  if (!assignment) {
    return res.status(404).json({ error: "Assignment not found" });
  }

  res.status(200).json(assignment);

}





const getAssignments = async (req, res) => {  // returns all the assignments in a class when you /assignments/CLASSID if you are in the class
  const classId = req.params.id;
  const user_id = req.user.id;


  // Validate classId
  if (!mongoose.Types.ObjectId.isValid(classId)) {
    return res.status(400).json({ error: "Invalid classroom ID" });
  }

  try {
    // Check if a classroom with the given classId exists and the user is a student in it

    let classroom;

    // Check if it's a student or teacher, then find classroom accordingly
    if (req.user.authority === 'student') {
      classroom = await Classroom.findOne({ _id: classId, students: user_id });
    } else if (req.user.authority === 'teacher') {
      classroom = await Classroom.findOne({ _id: classId, teachers: user_id });
    } else {
      return res.status(400).json({ error: "Invalid user authority" });
    }

    if (!classroom) {
      return res.status(400).json({ error: "cant find this classroom" });
    }


    // Find all assignments for the classroom

    const assignments = await Assignment.find({ classId: classId }).sort({ updatedAt: -1 });

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
  const { name, description, classId, dueDate } = req.body;
  const user_id = req.user._id;
  console.log("Assignment Details:");
  console.log("Name:", name);
  console.log("Description:", description);
  console.log("Class ID:", classId);
  console.log("Due Date:", dueDate);
  console.log("User ID:", user_id);

  

  // Check user's authority
  if (req.user.authority !== "teacher") {
    return res.status(403).json({ error: "Only teachers can create assignments" });
  }

  try {
    let classroom;
    console.log("inside try");

    if (!classId) {
      // If no classId is provided, check if the user has their own personal classroom
      console.log("user_id:", user_id, "Type:", typeof user_id);
      classroom = await Classroom.findOne({ _id: user_id });
      console.log("classroom", classroom);

      // If no classroom exists, create a new personal classroom
      if (!classroom) {
        console.log('No personal classroom found, creating a new one');
        const joincode = await generateJoinCode();
        const color = getRandomColor();
        classroom = await Classroom.create({
          _id: user_id, // Use the user ID as the classroom ID
          title: "Personal Classroom",
          description: "This is your personal classroom",
          joincode,
          teachers: [req.user.id],
          students: [],
          assignments: [],
          color
        });
      }
      console.log('Personal classroom created or found');
    } else {
      // Validate the provided classId and check if the user is a teacher in the classroom
      classroom = await Classroom.findOne({ _id: classId, teachers: user_id });
      if (!classroom) {
        console.log('User is not authorized to create assignments in this class');
        return res.status(400).json({ error: "Not authorized to create assignments in this class" });
      }
    }

    // Create a new assignment
    const assignment = await Assignment.create({
      name,
      description,
      classId: classroom._id, // Use the found or newly created classroom ID
      dueDate,
      submissions: [] // Initialize submissions as an empty array
    });

    // Add the assignment ID to the classroom's assignments array and save the classroom
    classroom.assignments.push(assignment._id);
    await classroom.save();

    console.log('Assignment created and added to the classroom:', assignment, classroom);
    res.status(201).json(assignment);
  } catch (error) {
    console.log('Failed to create assignment or add it to the classroom');
    res.status(500).json({ error: error.message });
  }
};




const deleteAssignment = async (req, res) => {
  const assignmentId = req.params.id; // ID of the assignment to be deleted
  const user_id = req.user.id; // ID of the user making the request
  console.log("trying to delete", assignmentId)

  // Check if the user is a teacher
  if (req.user.authority !== "teacher") {
    return res.status(403).json({ error: "Only teachers can delete assignments" });
  }

  try {
    // Find the assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    // Check if the user is a teacher in the classroom of the assignment
    const classroom = await Classroom.findOne({ _id: assignment.classId, teachers: user_id });
    if (!classroom) {
      return res.status(403).json({ error: "Not authorized to delete this assignment" });
    }

    console.log("pass all checks")


    // Delete associated files from S3
    for (const submission of assignment.submissions) {
      if (submission.pdfURL) {
        const filename = submission.pdfKey
        console.log(filename)
        try {
          await s3.deleteObject({ Bucket: BUCKET, Key: filename });
        }
        catch (error) {
          console.error(error);
          res.status(500).send('Error deleting file.');
        }
      }
    }
    console.log("deleted all files")


    // Delete the assignment
    await Assignment.findByIdAndDelete(assignmentId);
    console.log("deleted assignment")


    res.status(200).json({ message: "Assignment and associated files deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// NOW HERE ARE ALL THE SUBMISSION BASED ONES:






const getSubmissions = async (req, res) => {
  const assignmentId = req.params.id;
  const user_id = req.user.id;


  if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
    return res.status(404).json({ error: "No such Template and invalid ID" });
  }

  const assignment = await Assignment.findById(assignmentId);



  if (!assignment) {
    return res.status(404).json({ error: "Assignment not found" });
  }

  if (req.user.authority === 'student') {
    // Filter submissions to only include the user's submissions
    const userSubmissions = assignment.submissions.filter(sub => sub.studentId === user_id);

    const modifiedAssignment = {
      ...assignment.toObject(), // Convert the assignment to a plain object
      submissions: userSubmissions
    };

    return res.status(200).json(modifiedAssignment);
  }

  console.log("assignment", assignment);

  res.status(200).json(assignment);
}






// In assignmentController:

const updateAssignmentRubric = async (req, res) => {

  if (req.user.authority !== "teacher") {
    return res.status(403).json({ error: "Only teachers can update assignments rubrics" });
  }

    console.log("NEW ASSIGNMENT RUBRIC UPDATE");
    const { id } = req.params;
    const { rubric } = req.body;

    try {
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid assignment ID" });
      }

      // Update the rubric of the assignment
      const updatedAssignment = await Assignment.findByIdAndUpdate(
        id,
        { $set: { rubric } },
        { new: true }  // Return the updated document
      );

      if (!updatedAssignment) {
        return res.status(404).json({ error: "Assignment not found" });
      }

      res.status(200).json(updatedAssignment);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }

};


const updateSubmission = async (req, res) => {
  console.log(req.body);
  const { assignmentId, submissionId } = req.params;
  const { feedback,status } = req.body;
  const user_id = req.user.id;

  if (req.user.authority !== "teacher") {
    return res.status(403).json({ error: "Only teachers can update assignments rubrics" });
  }

  if (!mongoose.Types.ObjectId.isValid(assignmentId) || !mongoose.Types.ObjectId.isValid(submissionId)) {
    return res.status(400).json({ error: "Invalid assignment or submission ID" });
  }

  try {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    const classroom = await Classroom.findOne({ _id: assignment.classId, teachers: user_id });
    if (!classroom) {
      return res.status(403).json({ error: "Not authorized to access this assignment" });
    }

    const submission = assignment.submissions.id(submissionId);
    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    if (feedback) {
      submission.feedback = feedback;
    }

    if(status){
      submission.status = status;
    }

    await assignment.save();
    res.status(200).json(assignment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



module.exports = {
  getAssignment,
  getAssignments,
  createAssignment,
  deleteAssignment,
  getSubmissions,
  updateAssignmentRubric,
  updateSubmission
};
