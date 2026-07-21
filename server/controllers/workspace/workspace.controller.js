const {
  createWorkspace: createWorkspaceService,
  getUserWorkspacesService,
  getWorkspaceByIdService,
  updateWorkspacesService,
  deleteWorkspaceService,
} = require('../../services/workspace.service.js');
const User = require('../../models/user.model.js');

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

module.exports = {
  createWorkspace,
  getMyWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
};
