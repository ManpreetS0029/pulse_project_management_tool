const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minLength: 1,
      maxLength: 200,
    },
    workspace: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
      index: true,
    },
    workspaceName: {
      type: String,
      default: '',
    },
    project: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
      index: true,
    },
    projectName: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['todo', 'inProgress', 'inReview', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    assignees: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        name: { type: String, default: '' },
        initials: { type: String, default: '' },
        avatar: { type: String, default: '' },
      },
    ],
    assignee: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
    assigneeName: {
      type: String,
      default: '',
    },
    assigneeInitials: {
      type: String,
      default: '',
    },
    dueDate: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    // Flexible array models for subtasks, attachments/files, and comments (no strict Mongoose validation errors)
    subtasks: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    attachments: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    comments: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
