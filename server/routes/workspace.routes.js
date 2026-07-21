const express = require('express');

const {
  createWorkspace,
  getMyWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
} = require('../controllers/workspace/workspace.controller.js');

const { validate } = require('../middleware/validation.middleware.js');
const protect = require('../middleware/auth.middleware.js');

const {
  createWorkspaceSchema,
  updateWorkspaceSchema,
} = require('../validations/workspace.validation.js');

const router = express.Router();

router.use(protect);

router.post('/', validate(createWorkspaceSchema), createWorkspace);
router.post('/create', validate(createWorkspaceSchema), createWorkspace);
router.get('/my-workspaces', getMyWorkspaces);
router.get('/:workspaceId', getWorkspace);
router.put('/:workspaceId', validate(updateWorkspaceSchema), updateWorkspace);
router.delete('/:workspaceId', deleteWorkspace);

module.exports = router;
