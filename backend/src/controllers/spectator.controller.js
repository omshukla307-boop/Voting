// backend/src/controllers/spectator.controller.js
const { Candidate, User } = require("../models"); // Import User model here

exports.getCandidates = async (req, res) => {
    try {
        const candidates = await Candidate.findAll({
            order: [["voteCount", "DESC"]],
        });
        return res.status(200).json({
            success: true,
            candidates,
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.getFinalResults = async (req, res) => {
    try {
        const candidates = await Candidate.findAll({
            order: [["voteCount", "DESC"]],
        });

        const results = candidates.map((c) => ({
            id: c.id,
            name: c.name,
            party: c.party,
            votes: c.voteCount,
        }));

        // DYNAMIC FIX: Count all users who have the role of 'voter'
        const totalVoters = await User.count({ where: { role: 'voter' } });

        return res.status(200).json({
            success: true,
            results,
            totalVoters // Send the real count back to the frontend
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};