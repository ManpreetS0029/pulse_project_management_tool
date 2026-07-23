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
    populate: {
      path: 'owner',
      select: 'username email firstName lastName',
    },
  });

  const ownedWorkspaces = await Workspace.find({
    owner: userId,
    status: WORKSPACE_STATUS.ACTIVE,
  }).populate('owner', 'username email firstName lastName');

  const resultMap = new Map();

  memberships.forEach((m) => {
    if (m.workspace) {
      resultMap.set(m.workspace._id.toString(), {
        workspace: m.workspace,
        role: m.role || WORKSPACE_ROLES.ADMIN,
      });
    }
  });

  ownedWorkspaces.forEach((ws) => {
    const wsId = ws._id.toString();
    if (!resultMap.has(wsId)) {
      resultMap.set(wsId, {
        workspace: ws,
        role: WORKSPACE_ROLES.ADMIN,
      });

      // Auto-sync missing WorkspaceMember record in background
      WorkspaceMember.create({
        workspace: ws._id,
        user: userId,
        role: WORKSPACE_ROLES.ADMIN,
        status: WORKSPACE_MEMBER_STATUS.ACTIVE,
      }).catch((err) =>
        console.error('Auto-sync workspace member error:', err.message),
      );
    }
  });

  return Array.from(resultMap.values());
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

const acceptInviteService = async (workspaceId, userId, role) => {
  let existingMember = await WorkspaceMember.findOne({
    workspace: workspaceId,
    user: userId,
  });

  if (existingMember) {
    if (existingMember.status !== WORKSPACE_MEMBER_STATUS.ACTIVE) {
      existingMember.status = WORKSPACE_MEMBER_STATUS.ACTIVE;
      await existingMember.save();
    }
    return existingMember;
  }

  const assignedRole = role
    ? role.toUpperCase() === 'ADMIN'
      ? WORKSPACE_ROLES.ADMIN
      : role.toUpperCase() === 'PROJECT_MANAGER'
        ? WORKSPACE_ROLES.PROJECT_MANAGER
        : WORKSPACE_ROLES.MEMBER
    : WORKSPACE_ROLES.MEMBER;

  const createMember = await WorkspaceMember.create({
    workspace: workspaceId,
    user: userId,
    role: assignedRole,
    status: WORKSPACE_MEMBER_STATUS.ACTIVE,
  });

  if (!createMember) {
    const error = new Error('Failed to accept invite');
    error.statusCode = 500;

    throw error;
  }

  return createMember;
};

const getWorkspaceMembersService = async (workspaceId) => {
  const members = await WorkspaceMember.find({
    workspace: workspaceId,
    status: WORKSPACE_MEMBER_STATUS.ACTIVE,
  }).populate('user', 'username email firstName lastName');

  if (!members) {
    const error = new Error('Members not found');
    error.statusCode = 404;

    throw error;
  }

  return members;
};

module.exports = {
  createWorkspace,
  getUserWorkspacesService,
  getWorkspaceByIdService,
  updateWorkspacesService,
  deleteWorkspaceService,
  acceptInviteService,
  getWorkspaceMembersService,
};
