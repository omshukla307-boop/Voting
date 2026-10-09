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
            order: [["voteCount", "DESC"], ["id", "ASC"]],
        });

        if (!candidates || candidates.length === 0) {
            candidates = defaultCandidates;
        }

        const results = candidates.map((c) => ({
            id: c.id,
            name: c.name,
            party: c.party,
            symbol: c.symbol || '🗳️',
            votes: c.voteCount || 0,
            voteCount: c.voteCount || 0
        }));

        const totalVotes = results.reduce((sum, c) => sum + c.votes, 0);
        const leadingCandidate = results.length > 0 && results[0].votes > 0 ? results[0] : null;
        const runnerUp = results.length > 1 ? results[1] : null;
        const leadMargin = leadingCandidate && runnerUp ? (leadingCandidate.votes - runnerUp.votes) : (leadingCandidate ? leadingCandidate.votes : 0);

        const totalVoters = await User.count({ where: { role: 'voter' } }).catch(() => 0);

        return res.status(200).json({
            success: true,
            totalVotes,
            totalVoters,
            leadingCandidate: leadingCandidate ? {
                id: leadingCandidate.id,
                name: leadingCandidate.name,
                party: leadingCandidate.party,
                symbol: leadingCandidate.symbol,
                votes: leadingCandidate.votes,
                leadMargin: Math.max(0, leadMargin),
                voteShare: totalVotes > 0 ? ((leadingCandidate.votes / totalVotes) * 100).toFixed(1) : '0.0'
            } : null,
            results,
            candidates: results
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};