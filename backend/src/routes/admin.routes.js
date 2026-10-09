const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const requireAdmin = roleMiddleware('admin');

// Admin routes protected by auth + admin role check
router.post('/create', authMiddleware, requireAdmin, adminCtrl.createElection);
router.post('/candidate', authMiddleware, requireAdmin, adminCtrl.addCandidate);
router.get('/summary', authMiddleware, requireAdmin, adminCtrl.getSummary);

// Public or voter-accessible status & live audit route
router.get("/status", adminCtrl.getElectionStatus);
router.get("/votes", adminCtrl.getLiveVotes);

module.exports = router;