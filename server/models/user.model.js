const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
      minLength: 3,
      maxLength: 30,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
      maxLength: 30,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
      maxLength: 30,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxLength: 255,
      unique: true,
    },
    phone: {
      type: String,
      required: false,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
    },
    department: {
      type: String,
      trim: true,
      default: '',
    },
    role: {
      type: String,
      enum: ['ADMIN', 'PROJECT_MANAGER', 'MEMBER'],
      default: 'MEMBER',
    },
    status: {
      type: Boolean,
      default: true,
    },
    teams: {
      type: Array,
      ref: 'Team',
      default: [],
    },
    projects: {
      type: Array,
      ref: 'Project',
      default: [],
    },
    rememberMeToken: {
      type: String,
      default: '',
    },
    resetPasswordToken: {
      type: String,
      default: '',
    },
    resetPasswordTokenExpiry: {
      type: Date,
      default: '',
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('User', UserSchema);
