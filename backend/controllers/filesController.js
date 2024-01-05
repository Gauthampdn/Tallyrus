// Import necessary modules and configurations
const aws = require('aws-sdk');
const mongoose = require("mongoose");

const Classroom = require("../models/classroomModel");
const User = require("../models/userModel");
const Assignment = require("../models/assignmentModel");

const {
  S3
} = require('@aws-sdk/client-s3');

const multer = require('multer');
const multerS3 = require('multer-s3');


require('dotenv').config();

// AWS S3 configuration
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

// Multer configuration for file uploads
// Multer configuration for file uploads

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: BUCKET,
    contentDisposition: "inline",
    key: function (req, file, cb) {
      // Create a date string
      const date = new Date();
      const dateString = date.toISOString().replace(/:/g, '-'); // Replace colons to avoid file system issues

      // Concatenate date string with original file name
      const uniqueFileName = `${dateString}-${file.originalname}`;
      console.log("Unique file name is: ", uniqueFileName);

      // Pass the new file name to the callback
      cb(null, uniqueFileName);
    }
  })
});



// Exported controller functions
const uploadFile = async (req, res, next) => {
  const assignmentId = req.params.id;
  const user_id = req.user.id;

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }
  
  console.log(req.file.location);


  if (req.user.authority !== "student") {
    console.log("not a student");
    return res.status(403).json({ error: "Only students can submit assignments" });
  }

  try {
    console.log("in try")

    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      console.log("not valid id");
      return res.status(404).json({ error: "No such Template and invalid ID" });
    }

    // Find the assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      console.log("Assignment not found");

      return res.status(404).json({ error: "Assignment not found" });
    }

    // Check if the user is a student in the classroom of the assignment
    const classroom = await Classroom.findOne({ _id: assignment.classId, students: user_id });
    if (!classroom) {
      console.log("Not authorized to submit to this assignment");
      return res.status(403).json({ error: "Not authorized to submit to this assignment" });
    }

    console.log("passes all checks")

    // Create a new submission
    const newSubmission = {
      studentName: req.user.name,
      studentId: user_id,
      studentEmail: req.user.email,
      dateSubmitted: new Date(),
      status: 'submitted',
      pdfURL: req.file.location
    };

    // Add the submission to the assignment
    assignment.submissions.push(newSubmission);
    await assignment.save();

    console.log(newSubmission)

    res.status(201).json(newSubmission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

};








const listFiles = async (req, res) => {
  let r = await s3.listObjectsV2({ Bucket: BUCKET });
  let x = r.Contents.map(item => item.Key);
  res.send(x);
};

const downloadFile = async (req, res) => {
  const filename = req.params.filename;
  try {
    const data = await s3.getObject({ Bucket: BUCKET, Key: filename });

    // Set headers to display file in browser
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Content-Type', data.ContentType); // Sets the correct content type

    // Pipe the Body (readable stream) directly to the response
    data.Body.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error downloading file.');
  }
};


const deleteFile = async (req, res) => {
  const filename = req.params.filename;
  await s3.deleteObject({ Bucket: BUCKET, Key: filename });
  res.send('File Deleted Successfully');
};

module.exports = {
  uploadFile,
  listFiles,
  downloadFile,
  deleteFile,
  upload // Export the multer configuration
};
