const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [200, 'Company name cannot exceed 200 characters']
  },
  logo: {
    type: String,
    default: null
  },
  website: {
    type: String,
    default: null
  },
  industry: {
    type: String,
    required: [true, 'Industry is required'],
    enum: ['Technology', 'Finance', 'Healthcare', 'Education', 'E-commerce', 'Media', 'Manufacturing', 'Consulting', 'Startup', 'Other']
  },
  size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
    default: '1-10'
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  founded: {
    type: Number
  },
  linkedIn: String,
  twitter: String,
  instagram: String,
  email: String,
  phone: String,
  isVerified: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  tags: [String]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual: total internships posted
companySchema.virtual('internships', {
  ref: 'Internship',
  localField: '_id',
  foreignField: 'company',
  count: true
});

const Company = mongoose.model('Company', companySchema);
module.exports = Company;
