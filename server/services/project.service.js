const mongoose = require('mongoose');
const Project = require('../models/projects.model.js');
const Workspace = require('../models/workspace.model.js');

const createProject = async ({ data, workspaceId, addedBy }) => {
  const projectData = data || {};
  const ws = workspaceId || projectData.workspace;

  let resolvedWorkspaceId = null;
  let workspaceName = typeof ws === 'string' ? ws : '';

  if (ws && mongoose.Types.ObjectId.isValid(ws)) {
    resolvedWorkspaceId = ws;
  } else if (ws && typeof ws === 'string') {
    const foundWs = await Workspace.findOne({ name: ws });
    if (foundWs) {
      resolvedWorkspaceId = foundWs._id;
      workspaceName = foundWs.name;
    }
  }

  if (!resolvedWorkspaceId && addedBy && mongoose.Types.ObjectId.isValid(addedBy)) {
    const userWs = await Workspace.findOne({ owner: addedBy });
    if (userWs) {
      resolvedWorkspaceId = userWs._id;
      if (!workspaceName) workspaceName = userWs.name;
    }
  }

  const projectPayload = {
    name: projectData.name,
    workspace: resolvedWorkspaceId || undefined,
    workspaceName: workspaceName || projectData.workspace || 'Default Workspace',
    description: projectData.description || '',
    status: projectData.status || 'In Progress',
    priority: projectData.priority || 'Medium',
    dueDate: projectData.dueDate ? new Date(projectData.dueDate) : undefined,
    progress: projectData.progress || 0,
    tasksTotal: projectData.tasksTotal || 0,
    tasksCompleted: projectData.tasksCompleted || 0,
  };

  if (addedBy && mongoose.Types.ObjectId.isValid(addedBy)) {
    projectPayload.addedBy = addedBy;
  }

  const project = await Project.create(projectPayload);
  return project;
};

const getProjects = async ({ userId, workspaceId, workspaceName }) => {
  const query = {};

  if (workspaceId && workspaceId !== 'all' && mongoose.Types.ObjectId.isValid(workspaceId)) {
    query.workspace = workspaceId;
  } else if (workspaceName && workspaceName !== 'All Workspaces') {
    const regex = new RegExp(`^${workspaceName}$`, 'i');
    query.$or = [{ workspaceName: regex }];
    if (mongoose.Types.ObjectId.isValid(workspaceName)) {
      query.$or.push({ workspace: workspaceName });
    }
  }

  const projects = await Project.find(query).sort({ createdAt: -1 });
  return projects;
};

module.exports = {
  createProject,
  getProjects,
};

