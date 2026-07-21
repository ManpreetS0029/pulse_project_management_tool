const {
  WORKSPACE_ROLES,
  WORKSPACE_MEMBER_STATUS,
  WORKSPACE_STATUS,
} = require('../constants/workspace.constants.js');
const mongoose = require('mongoose');
const Workspace = require('../models/workspace.model.js');
const WorkspaceMember = require('../models/workspaceMember.model.js');

const createWorkspace = async ({ data, userId }) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const [workspace] = await Workspace.create(
      [
        {
          name: data.name,
          description: data.description || '',
          owner: userId,
          status: WORKSPACE_STATUS.ACTIVE,
        },
      ],
      { session },
    );

    await WorkspaceMember.create(
      [
        {
          workspace: workspace._id,
          user: userId,
          role: WORKSPACE_ROLES.ADMIN,
          status: WORKSPACE_MEMBER_STATUS.ACTIVE,
        },
      ],
      { session },
    );

    await session.commitTransaction();

    return workspace;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

const getUserWorkspacesService = async (userId) => {
  const memberships = await WorkspaceMember.find({
    user: userId,
    status: WORKSPACE_MEMBER_STATUS.ACTIVE,
  }).populate({
    path: 'workspace',
    match: {
      status: WORKSPACE_STATUS.ACTIVE,
    },
  });

  return memberships
    .filter((membership) => membership.workspace)
    .map((membership) => ({
      workspace: membership.workspace,
      role: membership.role,
    }));
};

const getWorkspaceByIdService = async (workspaceId) => {
  const workspace = await Workspace.findOne({
    _id: workspaceId,
    status: WORKSPACE_STATUS.ACTIVE,
  }).populate('owner', 'username email firstName lastName');

  if (!workspace) {
    const error = new Error('Workspace not found');
    error.statusCode = 404;
    throw error;
  }

  return workspace;
};

const updateWorkspacesService = async (workspaceId, data) => {
  const updateData = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
  }

  if (data.description !== undefined) {
    updateData.description = data.description;
  }

  const workspace = await Workspace.findOneAndUpdate(
    {
      _id: workspaceId,
      status: WORKSPACE_STATUS.ACTIVE,
    },
    {
      $set: updateData,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!workspace) {
    const error = new Error('Workspace not found');
    error.statusCode = 404;

    throw error;
  }

  return workspace;
};

const deleteWorkspaceService = async (workspaceId) => {
  const workspace = await Workspace.findOneAndUpdate(
    {
      _id: workspaceId,
      status: WORKSPACE_STATUS.ACTIVE,
    },
    {
      $set: {
        status: WORKSPACE_STATUS.ARCHIVED,
      },
    },
    {
      new: true,
    },
  );

  if (!workspace) {
    const error = new Error('Workspace not found');
    error.statusCode = 404;

    throw error;
  }

  return workspace;
};

module.exports = {
  createWorkspace,
  getUserWorkspacesService,
  getWorkspaceByIdService,
  updateWorkspacesService,
  deleteWorkspaceService,
};
