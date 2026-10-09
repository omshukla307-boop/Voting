const express = require('express');
const router = express.Router();
const { login } = require('../controllers/auth.controller');
const { issueToken } = require('../controllers/auth.controller');

router.post('/login', login);
router.post('/issue-token', issueToken);

module.exports = router;