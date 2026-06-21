const express  = require('express');
const router   = express.Router();
const { getDocuments, uploadDocument, getDocument, deleteDocument } = require('../controllers/document.controller');
const { protect }  = require('../middleware/auth.middleware');
const upload       = require('../middleware/upload.middleware');

router.use(protect);
router.get('/',          getDocuments);
router.post('/upload',   upload.single('file'), uploadDocument);
router.get('/:id',       getDocument);
router.delete('/:id',    deleteDocument);

module.exports = router;