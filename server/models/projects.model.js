const mongoose = require('mongoose');
const {
  PROJECT_PRIORITIES,
  PROJECT_STATUS,
} = require('../constants/projects.constants.js');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
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
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: false,
      index: true,
    },
    workspaceName: {
      type: String,
      default: '',
    },
    priority: {
      type: String,
      default: 'Medium',
    },
    status: {
      type: String,
      default: 'In Progress',
    },
    dueDate: {
      type: Date,
      required: false,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    tasksTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    tasksCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
