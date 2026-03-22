const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  requirements: {
    type: String,
    maxlength: [3000, 'Requirements cannot exceed 3000 characters']
  },
  responsibilities: {
    type: String,
    maxlength: [3000, 'Responsibilities cannot exceed 3000 characters']
  },
  skills: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Software Engineering', 'Data Science', 'Design', 'Marketing', 'Finance', 'Business', 'Research', 'Sales', 'Operations', 'HR', 'Legal', 'Other']
  },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Remote', 'Hybrid', 'On-site'],
    default: 'Full-time'
  },
  duration: {
    type: String,
    required: [true, 'Duration is required']
  },
  stipend: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    isPaid: { type: Boolean, default: true }
  },
  location: {
    city: String,
    country: String,
    isRemote: { type: Boolean, default: false }
  },
  openings: {
    type: Number,
    default: 1,
    min: 1
  },
  applicationDeadline: {
    type: Date,
    required: [true, 'Application deadline is required']
  },
  startDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'draft', 'paused'],
    default: 'active'
  },
  perks: [String],
  applicationCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  experienceLevel: {
    type: String,
    enum: ['Fresher', 'Beginner', 'Intermediate', 'Advanced'],
    default: 'Fresher'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for search
internshipSchema.index({ title: 'text', description: 'text', skills: 'text' });
internshipSchema.index({ status: 1, applicationDeadline: 1 });
internshipSchema.index({ company: 1 });
internshipSchema.index({ category: 1 });
internshipSchema.index({ 'location.isRemote': 1 });

const Internship = mongoose.model('Internship', internshipSchema);
module.exports = Internship;
