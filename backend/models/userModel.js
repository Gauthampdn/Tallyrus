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
  authority: {
    type: String,
    enum: ['teacher', 'student']
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  stripeCustomerId: {
    type: String,
    default: null
  },
  stripeSubscriptionId: {
    type: String,
    default: null
  },
  premiumExpiresAt: {
    type: Date,
    default: null
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
