const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const {
  login,
  register,
  forgotPassword,
  resetPassword,
} = require('../controllers/auth.controller');

router.post('/register', register);

router.post('/login', login);

router.post('/refresh', async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.refreshToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const refreshToken = cookies.refreshToken;

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN);
    const user = await User.findOne({ username: decoded.user })
      .collation({ locale: 'en', strength: 2 })
      .exec();

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const accessToken = jwt.sign(
      { user: user.username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' },
    );

    res.json({ accessToken, username: user.username });
  } catch (err) {
    return res.status(403).json({ message: 'Forbidden' });
  }
});

router.post('/logout', (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.refreshToken) return res.sendStatus(204); // No content

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  return res
    .status(200)
    .json({ success: true, message: 'Logged out successfully' });
});

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
