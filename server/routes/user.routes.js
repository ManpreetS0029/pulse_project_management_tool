const express = require('express');

const route = express.Router();

const protect = require('../middleware/auth.middleware.js');
const authorize = require('../middleware/role.middleware.js');

const {
  getProfile,
  adminDashboard,
  memberDashboard,
  managerDashboard,
} = require('../controllers/user.controller.js');

route.get('/profile', protect, getProfile);
route.get('/admin', protect, authorize('ADMIN'), adminDashboard);
route.get('/member', protect, authorize('MEMBER'), memberDashboard);
route.get('/manager', protect, authorize('MANAGER'), managerDashboard);

module.exports = route;
