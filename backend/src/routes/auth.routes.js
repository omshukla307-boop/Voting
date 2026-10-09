const express = require('express');
const router = express.Router();
const { login, adminLogin, issueToken, getNonce } = require('../controllers/auth.controller');

router.post('/login', login);
router.post('/admin-login', adminLogin);
router.post('/issue-token', issueToken);
router.get('/nonce', getNonce);

module.exports = router;