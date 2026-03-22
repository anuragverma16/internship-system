const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// Update student profile
router.put('/profile', protect, authorize('student'), async (req, res) => {
  try {
    const {
      university, major, graduationYear, gpa, skills, bio,
      linkedIn, github, portfolio, location, phone, experience, education
    } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          'studentProfile.university': university,
          'studentProfile.major': major,
          'studentProfile.graduationYear': graduationYear,
          'studentProfile.gpa': gpa,
          'studentProfile.skills': skills,
          'studentProfile.bio': bio,
          'studentProfile.linkedIn': linkedIn,
          'studentProfile.github': github,
          'studentProfile.portfolio': portfolio,
          'studentProfile.location': location,
          'studentProfile.phone': phone,
          'studentProfile.experience': experience,
          'studentProfile.education': education
        }
      },
      { new: true, runValidators: true }
    );

    res.json({ success: true, message: 'Profile updated', data: user.toPublicJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Save/unsave internship
router.post('/save-internship/:id', protect, authorize('student'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const internshipId = req.params.id;
    const savedList = user.studentProfile.savedInternships || [];
    const index = savedList.findIndex(id => id.toString() === internshipId);

    let message;
    if (index === -1) {
      savedList.push(internshipId);
      message = 'Internship saved';
    } else {
      savedList.splice(index, 1);
      message = 'Internship unsaved';
    }

    user.studentProfile.savedInternships = savedList;
    await user.save();

    res.json({ success: true, message, isSaved: index === -1 });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get saved internships
router.get('/saved-internships', protect, authorize('student'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'studentProfile.savedInternships',
        populate: { path: 'company', select: 'name logo industry' }
      });

    res.json({ success: true, data: user.studentProfile.savedInternships });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update name/avatar
router.put('/me', protect, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, avatar },
      { new: true }
    );
    res.json({ success: true, data: user.toPublicJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
