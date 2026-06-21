const express = require('express');
const router  = express.Router();
const { getAuditLogs, getAllAuditLogs } = require('../controllers/audit.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/',        authorize('admin', 'owner'), getAllAuditLogs);
router.get('/:docId',  getAuditLogs);

module.exports = router;