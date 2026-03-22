const Internship = require('../models/Internship');
const Company = require('../models/Company');
const Application = require('../models/Application');
const { validationResult } = require('express-validator');

// @desc    Get all internships (with filters/search)
// @route   GET /api/internships
// @access  Public
exports.getInternships = async (req, res) => {
  try {
    const {
      search, category, type, location, minStipend, maxStipend,
      isRemote, experienceLevel, page = 1, limit = 12, sort = '-createdAt', status
    } = req.query;

    const query = {};

    // Default to active internships for public
    if (!req.user || req.user.role === 'student') {
      query.status = 'active';
      query.applicationDeadline = { $gte: new Date() };
    } else if (status) {
      query.status = status;
    }

    // Search
    if (search) {
      query.$text = { $search: search };
    }

    // Filters
    if (category) query.category = category;
    if (type) query.type = type;
    if (experienceLevel) query.experienceLevel = experienceLevel;
    if (isRemote === 'true') query['location.isRemote'] = true;
    if (minStipend) query['stipend.min'] = { $gte: parseInt(minStipend) };
    if (maxStipend) query['stipend.max'] = { $lte: parseInt(maxStipend) };
    if (location) query['location.city'] = { $regex: location, $options: 'i' };

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [internships, total] = await Promise.all([
      Internship.find(query)
        .populate('company', 'name logo industry location isVerified rating')
        .populate('postedBy', 'name')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Internship.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: internships,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('getInternships error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single internship
// @route   GET /api/internships/:id
// @access  Public
exports.getInternship = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id)
      .populate('company', 'name logo industry location website description isVerified rating totalReviews size founded')
      .populate('postedBy', 'name email');

    if (!internship) {
      return res.status(404).json({ success: false, message: 'Internship not found' });
    }

    // Increment view count
    await Internship.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });

    // Check if student has applied
    let hasApplied = false;
    let isSaved = false;
    if (req.user && req.user.role === 'student') {
      const application = await Application.findOne({
        internship: internship._id,
        applicant: req.user.id
      });
      hasApplied = !!application;

      const User = require('../models/User');
      const user = await User.findById(req.user.id).select('studentProfile.savedInternships');
      isSaved = user?.studentProfile?.savedInternships?.includes(internship._id);
    }

    res.json({ success: true, data: { ...internship.toObject(), hasApplied, isSaved } });
  } catch (error) {
    console.error('getInternship error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create internship
// @route   POST /api/internships
// @access  Private (Company)
exports.createInternship = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const company = await Company.findOne({ user: req.user.id });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }

    const internship = await Internship.create({
      ...req.body,
      company: company._id,
      postedBy: req.user.id
    });

    const populated = await internship.populate('company', 'name logo industry location');

    res.status(201).json({ success: true, message: 'Internship posted successfully', data: populated });
  } catch (error) {
    console.error('createInternship error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update internship
// @route   PUT /api/internships/:id
// @access  Private (Company who posted it)
exports.updateInternship = async (req, res) => {
  try {
    let internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res.status(404).json({ success: false, message: 'Internship not found' });
    }

    // Verify ownership
    if (internship.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this internship' });
    }

    internship = await Internship.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('company', 'name logo industry location');

    res.json({ success: true, message: 'Internship updated', data: internship });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete internship
// @route   DELETE /api/internships/:id
// @access  Private (Company/Admin)
exports.deleteInternship = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res.status(404).json({ success: false, message: 'Internship not found' });
    }

    if (internship.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await internship.deleteOne();
    // Also delete related applications
    await Application.deleteMany({ internship: req.params.id });

    res.json({ success: true, message: 'Internship deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get company's internships
// @route   GET /api/internships/company/mine
// @access  Private (Company)
exports.getMyInternships = async (req, res) => {
  try {
    const company = await Company.findOne({ user: req.user.id });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    const internships = await Internship.find({ company: company._id })
      .sort('-createdAt')
      .lean();

    // Get application counts for each
    const withCounts = await Promise.all(internships.map(async (i) => {
      const count = await Application.countDocuments({ internship: i._id });
      return { ...i, applicationCount: count };
    }));

    res.json({ success: true, data: withCounts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get featured/trending internships
// @route   GET /api/internships/featured
// @access  Public
exports.getFeaturedInternships = async (req, res) => {
  try {
    const internships = await Internship.find({
      status: 'active',
      applicationDeadline: { $gte: new Date() }
    })
      .populate('company', 'name logo industry isVerified rating')
      .sort({ isFeatured: -1, viewCount: -1, createdAt: -1 })
      .limit(6)
      .lean();

    res.json({ success: true, data: internships });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
