const express = require('express');
const router  = express.Router();
const { getVersions, uploadVersion, restoreVersion } = require('../controllers/version.controller');
const { protect } = require('../middleware/auth.middleware');
const upload      = require('../middleware/upload.middleware');

router.use(protect);
router.get('/:docId/versions',                     getVersions);
router.post('/:docId/versions',  upload.single('file'), uploadVersion);
router.post('/:docId/versions/:versionId/restore', restoreVersion);

module.exports = router;