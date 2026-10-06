const express = require("express");
const router = express.Router();

const { getCandidates, getLiveResults, getFinalResults } = require("../controllers/spectator.controller");

router.get("/candidates", getCandidates);
router.get("/live", getLiveResults);
router.get("/results", getFinalResults);
router.get("/final", getFinalResults);

module.exports = router;