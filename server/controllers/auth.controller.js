const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { generateResetToken } = require('../utils/generate-token');
const { sendForgotPasswordEmail } = require('../services/email.service');

const login = async (req, res) => {
  const { identifier, password } = req.body || {};

  if (!identifier || !password) {
    return res
      .status(400)
      .json({ success: false, message: 'All fields are required' });
  }

  try {
    const user = await User.findOne({
      $or: [
        {
          username: identifier,
        },
        {
          email: identifier,
        },
      ],
    })
      .collation({ locale: 'en', strength: 2 })
      .exec();

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid Credentials' });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid Credentials' });
    }

    const accessToken = jwt.sign(
      { id: user._id, user: user.username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' },
    );
    const refreshToken = jwt.sign(
      { id: user._id, user: user.username },
      process.env.REFRESH_TOKEN,
      { expiresIn: '7d' },
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken, username: user.username, role: user.role });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const register = async (req, res) => {
  const {
    username,
    firstName,
    lastName,
    email,
    password,
    phone,
    role,
    department,
  } = req.body || {};

  if (!username || !firstName || !lastName || !email || !password || !phone) {
    return res
      .status(400)
      .json({ success: false, message: 'All fields are required' });
  }
  try {
    const duplicate = await User.findOne({
      $or: [{ username: username }, { email: email }],
    })
      .collation({ locale: 'en', strength: 2 })
      .exec();

    if (duplicate) {
      if (duplicate.username.toLowerCase() === username.toLowerCase()) {
        return res
          .status(409)
          .json({ success: false, message: 'Username already exists' });
      }
      return res
        .status(409)
        .json({ success: false, message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      firstName,
      lastName,
      email,
      phone,
      department: department ? department.trim() : '',
      role,
      password: hashedPassword,
    });

    await newUser.save();

    return res
      .status(201)
      .json({ success: true, message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const token = generateResetToken();

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordTokenExpiry = Date.now() + 15 * 60 * 1000;

    await user.save();

    const clientUrl =
      process.env.CLIENT_URL || process.env.APP_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password/${token}`;

    await sendForgotPasswordEmail(user.email, resetUrl);

    return res.status(200).json({
      success: true,
      message: 'Reset Password email sent',
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required',
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiry = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

module.exports = {
  login,
  register,
  forgotPassword,
  resetPassword,
};
