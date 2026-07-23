const express = require('express');

const {
  createWorkspace,
  getMyWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  inviteMembers,
  getWorkspaceMembers,
  acceptInvite,
  rejectInvite,
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

router.post('/:workspaceId/invite', inviteMembers);
router.get('/:workspaceId/members', getWorkspaceMembers);

router.get('/:workspaceId/join', acceptInvite);
router.post('/:workspaceId/join', acceptInvite);
router.get('/:workspaceId/reject', rejectInvite);
router.post('/:workspaceId/reject', rejectInvite);

module.exports = router;
