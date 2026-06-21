const express = require('express');
const router  = express.Router();
const { shareDocument, getPermissions, removePermission } = require('../controllers/permission.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.post('/:docId/share',              shareDocument);
router.get('/:docId/permissions',         getPermissions);
router.delete('/:docId/permissions/:userId', removePermission);

module.exports = router;