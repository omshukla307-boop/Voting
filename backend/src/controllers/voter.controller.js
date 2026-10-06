// backend/src/controllers/voter.controller.js
const { Vote, Candidate, Election } = require("../models");
const { sequelize } = require("../models");
const crypto = require("crypto");
const supabase = require("../config/supabaseClient");

exports.castVote = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const voterId = req.user.id;
    const { candidateId, electionId, txHash } = req.body;

    if (!candidateId || !electionId) {
      await t.rollback();
      return res.status(400).json({ error: "candidateId and electionId required" });
    }

    const election = await Election.findByPk(electionId);
    const now = new Date();

    if (!election) {
      await t.rollback();
      return res.status(404).json({ error: "Election not found" });
    }

    // Check active election window
    const isTimeActive = now >= new Date(election.startTime) && now <= new Date(election.endTime);
    if (election.status !== 'live' && !isTimeActive) {
      await t.rollback();
      return res.status(400).json({ error: "Election is not currently active" });
    }

    const existingVote = await Vote.findOne({
      where: { voterId, electionId },
    });

    if (existingVote) {
      await t.rollback();
      return res.status(400).json({ error: "You have already cast your vote in this election" });
    }

    const candidate = await Candidate.findOne({
      where: { id: candidateId, electionId }
    });

    if (!candidate) {
      await t.rollback();
      return res.status(400).json({ error: "Invalid candidate selected" });
    }

    const generatedHash = txHash || ('0x' + crypto.randomBytes(32).toString('hex'));

    const newVote = await Vote.create(
      { voterId, candidateId, electionId, voteHash: generatedHash },
      { transaction: t }
    );

    await Candidate.increment(
      { voteCount: 1 },
      { where: { id: candidateId }, transaction: t }
    );

    await t.commit();

    // Async sync vote record to Supabase Cloud Database (Votes table)
    try {
      await supabase.from('Votes').upsert([{
        id: newVote.id,
        voterId,
        candidateId,
        electionId,
        voteHash: generatedHash
      }]);
      console.log(`✅ Synced vote hash ${generatedHash} to Supabase`);
    } catch (supaErr) {
      console.warn("Supabase vote sync notice:", supaErr.message);
    }

    return res.status(200).json({
      success: true,
      message: "Vote cast successfully",
      voteHash: generatedHash
    });

  } catch (error) {
    await t.rollback();
    return res.status(500).json({ error: error.message });
  }
};
