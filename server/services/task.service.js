const mongoose = require('mongoose');
const Task = require('../models/task.model.js');

const createTask = async (data, createdBy) => {
  const {
    title,
    workspace,
    workspaceName,
    project,
    projectName,
    description,
    notes,
    status,
    priority,
    assignee,
    assigneeName,
    assigneeInitials,
    dueDate,
    tags,
    subtasks,
    attachments,
    comments,
  } = data;

  const task = await Task.create({
    title: (title || '').trim(),
    workspace: workspace && workspace !== 'all' ? workspace : undefined,
    workspaceName: workspaceName || '',
    project: project || undefined,
    projectName: projectName || '',
    description: description || notes || '',
    status: status || 'todo',
    priority: priority || 'Medium',
    assignee: assignee || undefined,
    assigneeName: assigneeName || '',
    assigneeInitials: assigneeInitials || '',
    dueDate: dueDate || null,
    tags: tags || [],
    subtasks: subtasks || [],
    attachments: attachments || [],
    comments: comments || [],
    createdBy: createdBy || undefined,
  });

  return task;
};

const getTasks = async ({ workspaceId, projectId, status }) => {
  const filter = {};

  if (workspaceId && workspaceId !== 'all') {
    if (mongoose.Types.ObjectId.isValid(workspaceId)) {
      filter.workspace = workspaceId;
    } else {
      filter.workspaceName = new RegExp(`^${workspaceId}$`, 'i');
    }
  }

  if (projectId && projectId !== 'all') {
    if (mongoose.Types.ObjectId.isValid(projectId)) {
      filter.project = projectId;
    } else {
      filter.projectName = new RegExp(`^${projectId}$`, 'i');
    }
  }

  if (status) filter.status = status;

  const tasks = await Task.find(filter).sort({ createdAt: -1 });
  return tasks;
};

const updateTask = async (id, updateData) => {
  if (updateData.notes && !updateData.description) {
    updateData.description = updateData.notes;
  }

  const task = await Task.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: false,
  });

  return task;
};

const deleteTask = async (id) => {
  const task = await Task.findByIdAndDelete(id);
  return task;
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
};
