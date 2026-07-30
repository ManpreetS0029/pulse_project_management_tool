const {
  createTask: createTaskService,
  getTasks: getTasksService,
  updateTask: updateTaskService,
  deleteTask: deleteTaskService,
} = require('../services/task.service.js');

const createTask = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.user?.userId;
    const task = await createTaskService(req.body, userId);

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Error in createTask controller:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create task',
    });
  }
};

const getTasks = async (req, res) => {
  try {
    const { workspaceId, projectId, status } = req.query;
    const tasks = await getTasksService({ workspaceId, projectId, status });

    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error('Error in getTasks controller:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch tasks',
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await updateTaskService(id, req.body);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Error in updateTask controller:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update task',
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await deleteTaskService(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteTask controller:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete task',
    });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
};
