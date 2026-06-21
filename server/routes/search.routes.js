const express = require('express');
const router  = express.Router();
const { search, getTags, createTag } = require('../controllers/search.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/',     search);
router.get('/tags', getTags);
router.post('/tags', createTag);

module.exports = router;