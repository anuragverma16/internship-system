const express = require('express');
const router = express.Router();
const {
  applyToInternship, getMyApplications, getInternshipApplications,
  updateApplicationStatus, withdrawApplication, getCompanyApplications
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/:internshipId', protect, authorize('student'), applyToInternship);
router.get('/my', protect, authorize('student'), getMyApplications);
router.get('/company', protect, authorize('company'), getCompanyApplications);
router.get('/internship/:internshipId', protect, authorize('company', 'admin'), getInternshipApplications);
router.patch('/:id/status', protect, authorize('company', 'admin'), updateApplicationStatus);
router.delete('/:id', protect, authorize('student'), withdrawApplication);

module.exports = router;
