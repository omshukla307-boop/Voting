const express = require('express');
const router = express.Router();
const { login, signup, issueToken } = require('../controllers/auth.controller');

router.post('/signup', signup);
router.post('/login', login);
router.post('/issue-token', issueToken);

module.exports = router;