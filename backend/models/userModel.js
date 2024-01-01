const mongoose = require("mongoose")


const Schema = mongoose.Schema

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
  authority: {
    type: String,
    enum: ['teacher', 'student']
  },
})

module.exports = mongoose.model("User", userSchema)