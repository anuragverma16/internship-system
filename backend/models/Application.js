const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  internship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Internship',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  coverLetter: {
    type: String,
    maxlength: [3000, 'Cover letter cannot exceed 3000 characters']
  },
  resume: {
    type: String // file path (can override profile resume)
  },
  resumeOriginalName: String,
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'shortlisted', 'interview', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  statusHistory: [{
    status: String,
    changedAt: { type: Date, default: Date.now },
    note: String
  }],
  companyNote: {
    type: String // internal note from company
  },
  interviewDate: Date,
  interviewType: {
    type: String,
    enum: ['Video Call', 'Phone', 'In-Person', 'Technical Test'],
    default: 'Video Call'
  },
  answers: [{
    question: String,
    answer: String
  }],
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Prevent duplicate applications
applicationSchema.index({ internship: 1, applicant: 1 }, { unique: true });

// Update status history on status change
applicationSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date()
    });
  }
  next();
});

const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;
