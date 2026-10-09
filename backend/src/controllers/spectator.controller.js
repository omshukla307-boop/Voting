// backend/src/controllers/spectator.controller.js
const { Candidate, User } = require("../models"); // Import User model here

exports.getCandidates = async (req, res) => {
    const defaultCandidates = [
        { id: 1, name: 'Aarav Mehta', party: 'People\'s Development Alliance (PDA)', symbol: '⚖️', electionId: 1, voteCount: 0 },
        { id: 2, name: 'Priya Sharma', party: 'National Progress Front (NPF)', symbol: '🪔', electionId: 1, voteCount: 0 },
        { id: 3, name: 'Kabir Verma', party: 'Unity and Reform Party (URP)', symbol: '🌾', electionId: 1, voteCount: 0 },
        { id: 4, name: 'Ananya Rao', party: 'Democratic Future League (DFL)', symbol: '🕊️', electionId: 1, voteCount: 0 },
        { id: 5, name: 'Rohan Kapoor', party: 'People\'s Welfare Movement (PWM)', symbol: '☀️', electionId: 1, voteCount: 0 },
        { id: 6, name: 'Meera Joshi', party: 'Independent Citizens Group (ICG)', symbol: '⛵', electionId: 1, voteCount: 0 },
        { id: 7, name: 'None of the Above (NOTA)', party: 'Independent / ECI', symbol: '❌', electionId: 1, voteCount: 0 }
    ];

    try {
        let candidates = await Candidate.findAll({
            order: [["id", "ASC"]],
        });
        if (!candidates || candidates.length === 0) {
            candidates = defaultCandidates;
        }
        return res.status(200).json({
            success: true,
            candidates,
        });
    } catch (error) {
        return res.status(200).json({
            success: true,
            candidates: defaultCandidates
        });
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