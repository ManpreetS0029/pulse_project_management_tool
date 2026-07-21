const mongoose = require('mongoose');
const {
  WORKSPACE_ROLES,
  WORKSPACE_MEMBER_STATUS,
} = require('../constants/workspace.constants.js');

const workspaceMemberSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: Object.values(WORKSPACE_ROLES),
      default: WORKSPACE_ROLES.MEMBER,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(WORKSPACE_MEMBER_STATUS),
      default: WORKSPACE_MEMBER_STATUS.ACTIVE,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

workspaceMemberSchema.index(
  {
    workspace: 1,
    user: 1,
  },
  {
    unique: true,
  },
);

module.exports = mongoose.model('WorkspaceMember', workspaceMemberSchema);
