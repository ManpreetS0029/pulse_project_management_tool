const {
  WORKSPACE_MEMBER_STATUS,
  WORKSPACE_ROLES,
} = require('../constants/workspace.constants.js');
const WorkspaceMember = require('../models/workspaceMember.model.js');
const User = require('../models/user.model.js');

const requireWorkspaceMember = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;

    let user = req.user;
    if (typeof user === 'string') {
      user = await User.findOne({ username: user });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const membership = await WorkspaceMember.findOne({
      workspace: workspaceId,
      user: user._id,
      status: WORKSPACE_MEMBER_STATUS.ACTIVE,
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this workspace',
      });
    }

    req.workspaceMembership = membership;
    next();
  } catch (error) {
    next(error);
  }
};

const requireWorkspacePermission = (...allowedRoles) => {
  return async (req, res, next) => {
    const membership = req.workspaceMembership;

    if (!membership || !allowedRoles.includes(membership.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action',
      });
    }

    next();
  };
};

const requireWorkspaceOwner = (req, res, next) => {
  const membership = req.workspaceMembership;

  if (!membership || membership.role !== WORKSPACE_ROLES.ADMIN) {
    return res.status(403).json({
      success: false,
      message: 'You are not an admin of this workspace',
    });
  }

  next();
};

module.exports = {
  requireWorkspaceMember,
  requireWorkspacePermission,
  requireWorkspaceOwner,
};
