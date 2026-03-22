const express = require('express');
const router = express.Router();
const {
  getInternships, getInternship, createInternship,
  updateInternship, deleteInternship, getMyInternships, getFeaturedInternships
} = require('../controllers/internshipController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

router.get('/featured', getFeaturedInternships);
router.get('/company/mine', protect, authorize('company'), getMyInternships);
router.get('/', optionalAuth, getInternships);
router.get('/:id', optionalAuth, getInternship);
router.post('/', protect, authorize('company'), createInternship);
router.put('/:id', protect, authorize('company', 'admin'), updateInternship);
router.delete('/:id', protect, authorize('company', 'admin'), deleteInternship);

module.exports = router;
