const mongoose = require("mongoose")

const Schema = mongoose.Schema


const submissionSchema = new Schema({
  studentName: {
    type: String,
    required: true,
  },
  studentId: {
    type: String,
    required: true,
  },
  studentEmail: {
    type: String,
  },
  dateSubmitted: {
    type: Date
  },
  status: {
    type: String,
    enum: ['open', 'submitted', 'graded'],  // make open, 
    default: 'open' // Optional: you can set a default status
  },
  feedback: {
    type: String,
  },
  pdfURL: {
    type: String,
  }
});


const assignmentSchema = new Schema({
  name: {
    type: String,  // name of the assignment
    required: true,
  },
  description: {  // description of the assignment (what it is about)
    type: String,
  },
  classId: {
    type: String,  // use the class's object id NOT THE JOIN CODE
    required: true 
  },
  dueDate: {
    type: Date
  },
  rubric: {  // the rubric we can store as schema type to?? ill do that
    type: String,
  },
  submissions: {
    type: [submissionSchema], // multiple submissions in an assignment
  }
});


// Create the model based on the schema

module.exports = mongoose.model('assignment', assignmentSchema);



/*
classroom
 - assignments
  - submissions for assignemnt



  when an assignment is made made an empty submission for all
  so when a student submits it edits the submissions 
  than having to make one and then have another one for editting for resubmissions
  

*/