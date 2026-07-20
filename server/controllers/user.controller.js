const getProfile = (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
};

const adminDashboard = (req, res) => {
  res.json({
    success: true,
    message: 'Welcome Admin',
  });
};

const managerDashboard = (req, res) => {
  res.json({
    success: true,
    message: 'Welcome Manager',
  });
};

const memberDashboard = (req, res) => {
  res.json({
    success: true,
    message: 'Welcome Member',
  });
};

module.exports = {
  getProfile,
  adminDashboard,
  managerDashboard,
  memberDashboard,
};
