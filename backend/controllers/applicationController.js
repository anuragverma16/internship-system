const Application = require('../models/Application');
const Internship = require('../models/Internship');
const User = require('../models/User');
const Company = require('../models/Company');

// @desc    Apply to internship
// @route   POST /api/applications/:internshipId
// @access  Private (Student)
exports.applyToInternship = async (req, res) => {
  try {
    const { internshipId } = req.params;
    const { coverLetter, answers } = req.body;

    const internship = await Internship.findById(internshipId);
    if (!internship) {
      return res.status(404).json({ success: false, message: 'Internship not found' });
    }

    if (internship.status !== 'active') {
      return res.status(400).json({ success: false, message: 'This internship is no longer accepting applications' });
    }

    if (new Date(internship.applicationDeadline) < new Date()) {
      return res.status(400).json({ success: false, message: 'Application deadline has passed' });
    }

    // Check if already applied
    const existing = await Application.findOne({ internship: internshipId, applicant: req.user.id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already applied to this internship' });
    }

    // Get user's resume
    const user = await User.findById(req.user.id);
    if (!user.studentProfile?.resume) {
      return res.status(400).json({ success: false, message: 'Please upload your resume before applying' });
    }

    const application = await Application.create({
      internship: internshipId,
      applicant: req.user.id,
      company: internship.company,
      coverLetter,
      resume: user.studentProfile.resume,
      resumeOriginalName: user.studentProfile.resumeOriginalName,
      answers: answers || [],
      statusHistory: [{ status: 'pending', changedAt: new Date() }]
    });

    // Increment application count
    await Internship.findByIdAndUpdate(internshipId, { $inc: { applicationCount: 1 } });

    const populated = await application
      .populate('internship', 'title company')
      .then(a => a.populate('company', 'name logo'));

    res.status(201).json({ success: true, message: 'Application submitted successfully!', data: populated });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already applied to this internship' });
    }
    console.error('applyToInternship error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get student's applications
// @route   GET /api/applications/my
// @access  Private (Student)
exports.getMyApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { applicant: req.user.id };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate({
          path: 'internship',
          select: 'title category type duration stipend location status applicationDeadline',
          populate: { path: 'company', select: 'name logo industry' }
        })
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit)),
      Application.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: applications,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get applications for an internship (Company)
// @route   GET /api/applications/internship/:internshipId
// @access  Private (Company)
exports.getInternshipApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const internship = await Internship.findById(req.params.internshipId);
    if (!internship) {
      return res.status(404).json({ success: false, message: 'Internship not found' });
    }

    // Verify company owns this internship
    if (internship.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const query = { internship: req.params.internshipId };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate('applicant', 'name email avatar studentProfile')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit)),
      Application.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: applications,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update application status (Company)
// @route   PATCH /api/applications/:id/status
// @access  Private (Company/Admin)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, note, interviewDate, interviewType } = req.body;

    const application = await Application.findById(req.params.id)
      .populate('internship', 'postedBy');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.internship.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    application.status = status;
    application.statusHistory.push({ status, changedAt: new Date(), note });
    if (note) application.companyNote = note;
    if (interviewDate) application.interviewDate = interviewDate;
    if (interviewType) application.interviewType = interviewType;
    application.isRead = true;

    await application.save();

    res.json({ success: true, message: `Application ${status}`, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Withdraw application (Student)
// @route   DELETE /api/applications/:id
// @access  Private (Student)
exports.withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      applicant: req.user.id
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (['accepted', 'rejected'].includes(application.status)) {
      return res.status(400).json({ success: false, message: 'Cannot withdraw a finalized application' });
    }

    application.status = 'withdrawn';
    application.statusHistory.push({ status: 'withdrawn', changedAt: new Date() });
    await application.save();

    await Internship.findByIdAndUpdate(application.internship, { $inc: { applicationCount: -1 } });

    res.json({ success: true, message: 'Application withdrawn' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all applications for company's internships
// @route   GET /api/applications/company
// @access  Private (Company)
exports.getCompanyApplications = async (req, res) => {
  try {
    const company = await Company.findOne({ user: req.user.id });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    const internships = await Internship.find({ company: company._id }).select('_id');
    const internshipIds = internships.map(i => i._id);

    const { status, page = 1, limit = 20 } = req.query;
    const query = { internship: { $in: internshipIds } };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate('applicant', 'name email avatar studentProfile.university studentProfile.major studentProfile.skills studentProfile.gpa')
        .populate('internship', 'title category type')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit)),
      Application.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: applications,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
