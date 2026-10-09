// backend/src/routes/ai.routes.js
const express = require("express");
const router = express.Router();
const aiCtrl = require("../controllers/ai.controller");

router.post("/chat", aiCtrl.handleChat);

module.exports = router;
