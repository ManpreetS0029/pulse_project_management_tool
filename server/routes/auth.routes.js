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

const mongoose = require('mongoose');

router.post('/refresh', async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.refreshToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const refreshToken = cookies.refreshToken;

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN);
    const userIdentifier = decoded.id || decoded.user;
    const isId = mongoose.Types.ObjectId.isValid(userIdentifier);
    const query = isId
      ? { $or: [{ _id: userIdentifier }, { username: userIdentifier }] }
      : { username: userIdentifier };

    const user = await User.findOne(query)
      .collation({ locale: 'en', strength: 2 })
      .exec();

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const accessToken = jwt.sign(
      { id: user._id, user: user.username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' },
    );

    res.json({ accessToken, username: user.username, role: user.role });
  } catch (err) {
    return res.status(403).json({ message: 'Forbidden' });
  }
});

router.post('/logout', (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.refreshToken) return res.sendStatus(204); // No content

  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  });

  return res
    .status(200)
    .json({ success: true, message: 'Logged out successfully' });
});

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
