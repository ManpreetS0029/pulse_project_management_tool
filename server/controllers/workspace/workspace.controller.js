const mongoose = require('mongoose');
const {
  createWorkspace: createWorkspaceService,
  getUserWorkspacesService,
  getWorkspaceByIdService,
  updateWorkspacesService,
  deleteWorkspaceService,
  acceptInviteService,
  getWorkspaceMembersService,
} = require('../../services/workspace.service.js');
const User = require('../../models/user.model.js');
const { sendInviteMemberEmail } = require('../../services/email.service.js');

const createWorkspace = async (req, res, next) => {
  try {
    let userId = req.user?.id || req.user?._id;

    if (!userId) {
      const identifier =
        typeof req.user === 'string' ? req.user : req.user?.user;
      const user = await User.findOne({
        $or: [{ username: identifier }, { email: identifier }],
      });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized user',
        });
      }
      userId = user._id;
    }

    const workspace = await createWorkspaceService({
      data: req.body,
      userId,
    });

    res.status(201).json({
      success: true,
      data: workspace,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

const getMyWorkspaces = async (req, res, next) => {
  try {
    let userId = req.user?.id || req.user?._id || req.user?.userId;

    if (!userId) {
      const identifier =
        typeof req.user === 'string' ? req.user : req.user?.user;
      const user = await User.findOne({
        $or: [{ username: identifier }, { email: identifier }],
      });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized user',
        });
      }
      userId = user._id;
    }

    const workspaces = await getUserWorkspacesService(userId);

    res.status(200).json({
      success: true,
      data: workspaces,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

const getWorkspace = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    if (!workspaceId || workspaceId === 'undefined' || !mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid workspace ID',
      });
    }
    const workspace = await getWorkspaceByIdService(workspaceId);

    res.status(200).json({
      success: true,
      data: workspace,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

const updateWorkspace = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    if (!workspaceId || workspaceId === 'undefined' || !mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid workspace ID',
      });
    }
    const workspace = await updateWorkspacesService(workspaceId, req.body);

    res.status(200).json({
      success: true,
      data: workspace,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

const deleteWorkspace = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    if (!workspaceId || workspaceId === 'undefined' || !mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid workspace ID',
      });
    }
    const workspace = await deleteWorkspaceService(workspaceId);

    res.status(200).json({
      success: true,
      message: 'Workspace deleted successfully',
      data: workspace,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

const inviteMembers = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    if (!workspaceId || workspaceId === 'undefined' || !mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid workspace ID',
      });
    }
    const { role } = req.body;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const inviteUrl = req.body.url || `${clientUrl}/workspace/invite/${workspaceId}?role=${encodeURIComponent(role || 'MEMBER')}`;

    await sendInviteMemberEmail(
      req.body.email,
      req.body.workspaceName || 'Pulse Workspace',
      inviteUrl,
    );

    res.status(200).json({
      success: true,
      message: 'Workspace invite sent successfully',
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

const acceptInvite = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    if (!workspaceId || workspaceId === 'undefined' || !mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid workspace ID',
      });
    }
    const role = req.query?.role || req.body?.role;
    let userId = req.user?.id || req.user?._id || req.user?.userId;
    const workspace = await acceptInviteService(workspaceId, userId, role);

    res.status(200).json({
      success: true,
      data: workspace,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

const rejectInvite = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    if (!workspaceId || workspaceId === 'undefined' || !mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid workspace ID',
      });
    }

    res.status(200).json({
      success: true,
      workspaceId: workspaceId,
      message: 'Invite rejected successfully',
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

const getWorkspaceMembers = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    if (!workspaceId || workspaceId === 'undefined' || !mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid workspace ID',
      });
    }
    const members = await getWorkspaceMembersService(workspaceId);

    res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

module.exports = {
  createWorkspace,
  getMyWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  inviteMembers,
  acceptInvite,
  rejectInvite,
  getWorkspaceMembers,
};
