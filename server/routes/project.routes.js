const express = require('express');

const {
  createProject,
  getProjects,
} = require('../controllers/project/project.controller.js');

const { validate } = require('../middleware/validation.middleware.js');
const protect = require('../middleware/auth.middleware.js');

const { createProjectSchema } = require('../validations/project.validation.js');

const router = express.Router();

router.use(protect);

router.get('/', getProjects);
router.get('/workspace/:workspaceId', getProjects);

router.post('/', validate(createProjectSchema), createProject);
router.post('/create', validate(createProjectSchema), createProject);

module.exports = router;

