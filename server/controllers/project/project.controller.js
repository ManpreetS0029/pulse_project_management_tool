const mongoose = require('mongoose');
const {
  createProject: createProjectService,
  getProjects: getProjectsService,
} = require('../../services/project.service.js');
const User = require('../../models/user.model.js');

const createProject = async (req, res, next) => {
  try {
    let userId = req.user?.id || req.user?._id || req.user?.userId;

    if (!userId && req.user) {
      const identifier = typeof req.user === 'string' ? req.user : req.user?.user;
      if (identifier) {
        const user = await User.findOne({
          $or: [{ username: identifier }, { email: identifier }],
        });
        if (user) userId = user._id;
      }
    }

    const project = await createProjectService({
      data: req.body,
      addedBy: userId,
    });

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

const getProjects = async (req, res, next) => {
  try {
    let userId = req.user?.id || req.user?._id || req.user?.userId;
    const { workspaceId, workspaceName, workspace } = req.query;
    const targetWsId = req.params?.workspaceId || workspaceId || (mongoose.Types.ObjectId.isValid(workspace) ? workspace : undefined);
    const targetWsName = workspaceName || (typeof workspace === 'string' && !mongoose.Types.ObjectId.isValid(workspace) ? workspace : undefined);

    const projects = await getProjectsService({
      userId,
      workspaceId: targetWsId,
      workspaceName: targetWsName,
    });

    res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

module.exports = {
  createProject,
  getProjects,
};

