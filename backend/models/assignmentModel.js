const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const rubricValueSchema = new Schema({
  point: {
    type: Number,
  },
  description: {
    type: String,
  }
});

const rubricSchema = new Schema({
  name: {
    type: String,
  },
  values: [rubricValueSchema]
});

const feedbackCriteriaSchema = new Schema({
  name: {
    type: String,
  },
  score: {
    type: Number,
  },
  total:{
    type: Number,
  },
  comments: {
    type: String,
  },
});

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
    enum: ['open', 'submitted', 'graded', 'regrade', 'error', 'grading'],  // make open, 
    default: 'open' // Optional: you can set a default status
  },
  feedback: {
    type: [feedbackCriteriaSchema],
    default: []
  },
  pdfURL: {
    type: String,
  },
  pdfKey: {
    type: String,
  },
  aiScore: {
    type: String,  // Add field for AI score
    default: 0
  },
  isOldGradedEssay: {
    type: Boolean,  // Add field for AI score
    default: false
  },
});

const assignmentSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  classId: {
    type: String,
    required: true 
  },
  dueDate: {
    type: Date
  },
  rubric: {
    type: [rubricSchema],
  },
  submissions: {
    type: [submissionSchema],
  }
}, { timestamps: true });

module.exports = mongoose.model('assignment', assignmentSchema);
