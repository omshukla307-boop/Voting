// backend/src/routes/ai.routes.js
// Updated: Digital Voting System of India — AI Assistant Chat API Routes
const express = require("express");
const router = express.Router();
const aiCtrl = require("../controllers/ai.controller");

router.post("/chat", aiCtrl.handleChat);

module.exports = router;
