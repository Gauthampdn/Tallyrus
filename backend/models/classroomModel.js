const mongoose = require("mongoose")

const Schema = mongoose.Schema


// Schema for the main object
const classroomSchema = new Schema({
  title: {
    type: String, // name of class
    required: true
  },
  description: {
    type: String,  // period and all that
    required: false
  },
  joincode: {
    type: String,  // this is a unique join code for the class
    required: true 
  },
  teachers: {
    type: [String], // the id's of the teacher users (I did an array because if in the future multiple teacher teach 1 class its easier)
    required: true
  },
  students: {
    type: [String], // the id's of the students users in the class
  },
  assignments:{
    type: [String], // all the assignments in the class (check the assignment schema)
  },
  color: {
    type: String, // color for the class card background
    default: 'bg-stone-100'
  }
}, { timestamps: true });


// Create the model based on the schema

module.exports = mongoose.model('classroom', classroomSchema);

