const express = require('express');
const router = express.Router();
const { login, signup, issueToken, getProfile } = require('../controllers/auth.controller');
const authenticate = require('../middleware/authMiddleware');

router.post('/signup', signup);
router.post('/login', login);
router.post('/issue-token', issueToken);
router.get('/me', authenticate, getProfile);

module.exports = router;