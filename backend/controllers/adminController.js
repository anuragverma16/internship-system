const User = require('../models/User');
const Company = require('../models/Company');
const Internship = require('../models/Internship');
const Application = require('../models/Application');

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
exports.getAnalytics = async (req, res) => {
  try {
    const [
      totalStudents,
      totalCompanies,
      totalInternships,
      totalApplications,
      activeInternships,
      recentUsers,
      applicationsByStatus,
      internshipsByCategory,
      monthlyApplications
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'company' }),
      Internship.countDocuments(),
      Application.countDocuments(),
      Internship.countDocuments({ status: 'active' }),
      User.find().sort('-createdAt').limit(5).select('name email role createdAt avatar'),
      Application.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Internship.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 }
      ]),
      Application.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 }
      ])
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalStudents,
          totalCompanies,
          totalInternships,
          totalApplications,
          activeInternships
        },
        recentUsers,
        applicationsByStatus,
        internshipsByCategory,
        monthlyApplications
      }
    });
  } catch (error) {
    console.error('getAnalytics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all users with filters
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20, isActive } = req.query;
    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(query).sort('-createdAt').skip(skip).limit(parseInt(limit)).populate('companyProfile', 'name industry'),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: users,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Toggle user active status
// @route   PATCH /api/admin/users/:id/toggle
// @access  Private (Admin)
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot deactivate admin accounts' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, data: { isActive: user.isActive } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete admin accounts' });
    }

    await user.deleteOne();
    if (user.role === 'company') {
      await Company.deleteOne({ user: req.params.id });
    }

    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Verify company
// @route   PATCH /api/admin/companies/:id/verify
// @access  Private (Admin)
exports.verifyCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    company.isVerified = !company.isVerified;
    await company.save();
    res.json({ success: true, message: `Company ${company.isVerified ? 'verified' : 'unverified'}` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Feature/unfeature internship
// @route   PATCH /api/admin/internships/:id/feature
// @access  Private (Admin)
exports.featureInternship = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) {
      return res.status(404).json({ success: false, message: 'Internship not found' });
    }
    internship.isFeatured = !internship.isFeatured;
    await internship.save();
    res.json({ success: true, message: `Internship ${internship.isFeatured ? 'featured' : 'unfeatured'}` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
