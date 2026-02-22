const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  getAnalytics, getUsers, updateUser, getAdminListings,
  getReports, updateReport, updateListingStatus,
} = require('../controllers/adminController');

// All admin routes require auth + admin role
router.use(authMiddleware, adminMiddleware);

router.get('/analytics', getAnalytics);
router.get('/users', getUsers);
router.patch('/users/:id', updateUser);
router.get('/listings', getAdminListings);
router.patch('/listings/:id/status', updateListingStatus);
router.get('/reports', getReports);
router.patch('/reports/:id', updateReport);

module.exports = router;
