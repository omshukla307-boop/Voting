const express = require('express');
const router = express.Router();
const { login, adminLogin, issueToken, getNonce } = require('../controllers/auth.controller');
const digilockerCtrl = require('../controllers/digilocker.controller');

router.post('/login', login);
router.post('/admin-login', adminLogin);
router.post('/issue-token', issueToken);
router.get('/nonce', getNonce);

// DigiLocker OAuth 2.0 Integration Routes
router.get('/digilocker/url', digilockerCtrl.getAuthUrl);
router.get('/digilocker/callback', digilockerCtrl.handleCallback);

module.exports = router;