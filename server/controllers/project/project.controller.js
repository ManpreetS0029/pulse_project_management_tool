const mongoose = require('mongoose');
const {
  createProject: createProjectService,
  getProjects: getProjectsService,
  updateProject: updateProjectService,
  deleteProject: deleteProjectService,
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

const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await updateProjectService(id, req.body);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to update project',
    });
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await deleteProjectService(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to delete project',
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
};


