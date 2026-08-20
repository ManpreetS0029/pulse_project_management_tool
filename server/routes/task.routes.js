const express = require('express');
const {
  createTask,
  getTasks,
  getTasksByProjectId,
  updateTask,
  deleteTask,
} = require('../controllers/task.controller.js');
const protect = require('../middleware/auth.middleware.js');
const { validate } = require('../middleware/validation.middleware.js');
const {
  createTaskSchema,
  updateTaskSchema,
} = require('../validations/task.validation.js');
const upload = require('../middleware/upload.middleware.js');

const router = express.Router();

router.use(protect);

router.get('/', getTasks);
router.get('/:projectId', getTasksByProjectId);
router.post('/', validate(createTaskSchema), createTask);
router.put('/:id', validate(updateTaskSchema), updateTask);
router.delete('/:id', deleteTask);
router.post('/upload', upload.array('files', 10), (req, res) => {
  res.json({
    success: true,
    files: req.files,
  });
});

module.exports = router;
