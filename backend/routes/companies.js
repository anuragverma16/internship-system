const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const { protect, authorize } = require('../middleware/auth');

// Get company profile
router.get('/me', protect, authorize('company'), async (req, res) => {
  try {
    const company = await Company.findOne({ user: req.user.id });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }
    res.json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update company profile
router.put('/me', protect, authorize('company'), async (req, res) => {
  try {
    const company = await Company.findOneAndUpdate(
      { user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    res.json({ success: true, message: 'Company profile updated', data: company });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all companies (public)
router.get('/', async (req, res) => {
  try {
    const { search, industry, page = 1, limit = 12 } = req.query;
    const query = {};
    if (industry) query.industry = industry;
    if (search) query.name = { $regex: search, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [companies, total] = await Promise.all([
      Company.find(query).sort('-createdAt').skip(skip).limit(parseInt(limit)),
      Company.countDocuments(query)
    ]);

    res.json({ success: true, data: companies, pagination: { total, page: parseInt(page) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single company
router.get('/:id', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).populate('user', 'name email');
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
    res.json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
