const express = require('express');
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} = require('../controllers/task.controller.js');
const protect = require('../middleware/auth.middleware.js');
const { validate } = require('../middleware/validation.middleware.js');
const {
  createTaskSchema,
  updateTaskSchema,
} = require('../validations/task.validation.js');

const router = express.Router();

router.use(protect);

router.get('/', getTasks);
router.post('/', validate(createTaskSchema), createTask);
router.put('/:id', validate(updateTaskSchema), updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
