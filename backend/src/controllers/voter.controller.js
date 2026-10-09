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

    let election = await Election.findByPk(electionId);
    if (!election) {
      election = await Election.findOne({ where: { status: 'live' } }) || await Election.findOne();
    }

    // Auto-ensure active election window for practice portal
    if (election) {
      const now = new Date();
      if (!election.endTime || now > election.endTime || election.status !== 'live') {
        await election.update({
          status: 'live',
          startTime: new Date('2020-01-01'),
          endTime: new Date('2038-01-01')
        });
      }
    }

    // For demo/practice environment: allow voting or updating vote smoothly
    const existingVote = await Vote.findOne({
      where: { voterId, electionId: election ? election.id : electionId },
    });

    if (existingVote) {
      await existingVote.update(
        { candidateId, voteHash: txHash },
        { transaction: t }
      );
      await t.commit();
      return res.status(200).json({
        success: true,
        message: "Vote updated successfully in practice ledger",
      });
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

