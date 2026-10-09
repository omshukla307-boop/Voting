// backend/src/controllers/voter.controller.js

const { Vote, Candidate, Election } = require("../models");
const { sequelize } = require("../models");
const crypto = require("crypto");



exports.castVote = async (req, res) => {
  const t = await sequelize.transaction();

  try {

    const voterId = req.user.id;  //----- Assuming user ID is available in req.user -----//
    const { candidateId, electionId, txHash } = req.body;

    if (!candidateId || !electionId) {
      await t.rollback();
      return res.status(400).json({ error: "candidateId and electionId required" });
    }

    const election = await Election.findByPk(electionId);

    console.log("Incoming electionId:", electionId);
    console.log("Election found:", election);

    const now = new Date();
    if (!election || now < election.startTime || now > election.endTime) {
      await t.rollback();
      return res.status(400).json({ error: "Election is not within the active time window" });
    }

    const existingVote = await Vote.findOne({
      where: { voterId, electionId },
    });

    if (existingVote) {
      await t.rollback();
      return res.status(400).json({ error: "You have already voted" });
    }

    const candidate = await Candidate.findOne({
      where: { id: candidateId, electionId }
    });

    if (!candidate) {
      await t.rollback();
      return res.status(400).json({ error: "Invalid candidate" });
    }

    await Vote.create(
      // Save the real txHash into your database's voteHash column!
      { voterId, candidateId, electionId, voteHash: txHash },
      { transaction: t }
    );

    await Candidate.increment(
      { voteCount: 1 },
      { where: { id: candidateId }, transaction: t }
    );

    await t.commit();

    return res.status(200).json({
      success: true,
      message: "Vote cast successfully",
    });

  } catch (error) {
    await t.rollback();
    return res.status(500).json({ error: error.message });
  }
};

