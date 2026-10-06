const express = require('express');
const router = express.Router();
const { login, register, issueToken } = require('../controllers/auth.controller');

router.post('/login', login);
router.post('/register', register);
router.post('/signup', register);
router.post('/issue-token', issueToken);

module.exports = router;