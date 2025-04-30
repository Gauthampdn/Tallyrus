const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const fileSchema = new Schema({
  studentName: String,
  pdfURL: String,
  pdfKey: String,
  dateSubmitted: Date,
  status: String,
  isOldGradedEssay: {
    type: Boolean,
    default: false
  }
});

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  id: {
    type: String,
    required: true
  },
  picture: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  surname: {  // Agregado
    type: String, 
    required: false
  },
  dateOfBirth: { // Agregado
    type: Date,
    required: false
  },
  authority: {
    type: String,
    enum: ['teacher', 'student']
  },
  numGraded: {
    type: Number,
    default: 0
  },
  uploadedFiles: {
    type: [fileSchema], // New field to store the uploaded files
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
