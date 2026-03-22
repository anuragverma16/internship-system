const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const User = require('../models/User');
const Company = require('../models/Company');
const { protect } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

// Upload resume
router.post('/resume', protect, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const relativePath = `/uploads/resumes/${req.file.filename}`;

    // Delete old resume if exists
    const user = await User.findById(req.user.id);
    if (user.studentProfile?.resume) {
      const oldPath = path.join(__dirname, '..', user.studentProfile.resume);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await User.findByIdAndUpdate(req.user.id, {
      'studentProfile.resume': relativePath,
      'studentProfile.resumeOriginalName': req.file.originalname
    });

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      data: { path: relativePath, originalName: req.file.originalname }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

// Upload avatar
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const relativePath = `/uploads/avatars/${req.file.filename}`;
    await User.findByIdAndUpdate(req.user.id, { avatar: relativePath });
    res.json({ success: true, message: 'Avatar uploaded', data: { path: relativePath } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

// Upload company logo
router.post('/logo', protect, upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const relativePath = `/uploads/logos/${req.file.filename}`;
    await Company.findOneAndUpdate({ user: req.user.id }, { logo: relativePath });
    res.json({ success: true, message: 'Logo uploaded', data: { path: relativePath } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

module.exports = router;
