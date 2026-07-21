const mongoose = require('mongoose');
const { WORKSPACE_STATUS } = require('../constants/workspace.constants.js');

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workspace name is required'],
      trim: true,
      minLength: 2,
      maxLength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxLength: 500,
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(WORKSPACE_STATUS),
      default: WORKSPACE_STATUS.ACTIVE,
    },
  },
  {
    timestamps: true,
  },
);

const Workspace = mongoose.model('Workspace', workspaceSchema);

module.exports = Workspace;
