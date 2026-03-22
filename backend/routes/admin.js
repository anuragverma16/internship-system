const express = require('express');
const router = express.Router();
const {
  getAnalytics, getUsers, toggleUserStatus, deleteUser,
  verifyCompany, featureInternship
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/analytics', getAnalytics);
router.get('/users', getUsers);
router.patch('/users/:id/toggle', toggleUserStatus);
router.delete('/users/:id', deleteUser);
router.patch('/companies/:id/verify', verifyCompany);
router.patch('/internships/:id/feature', featureInternship);

module.exports = router;
