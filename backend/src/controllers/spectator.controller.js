// backend/src/controllers/spectator.controller.js
const { Candidate, User } = require("../models");

const fictionalMap = {
    1: { name: 'Aarav Mehta', party: 'People\'s Development Alliance (PDA)', symbol: '⚖️' },
    2: { name: 'Priya Sharma', party: 'National Progress Front (NPF)', symbol: '🪔' },
    3: { name: 'Kabir Verma', party: 'Unity and Reform Party (URP)', symbol: '🌾' },
    4: { name: 'Ananya Rao', party: 'Democratic Future League (DFL)', symbol: '🕊️' },
    5: { name: 'Rohan Kapoor', party: 'People\'s Welfare Movement (PWM)', symbol: '☀️' },
    6: { name: 'Meera Joshi', party: 'Independent Citizens Group (ICG)', symbol: '⛵' },
    7: { name: 'None of the Above (NOTA)', party: 'Independent / ECI', symbol: '❌' }
};

function sanitizeCandidate(c, index) {
    const id = c.id || (index + 1);
    const f = fictionalMap[id] || fictionalMap[((index) % 7) + 1];
    return {
        id: id,
        name: f.name,
        party: f.party,
        symbol: f.symbol,
        votes: c.voteCount || c.votes || 0,
        voteCount: c.voteCount || c.votes || 0
    };
}

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
        const sanitized = candidates.map((c, idx) => sanitizeCandidate(c, idx));
        return res.status(200).json({
            success: true,
            candidates: sanitized,
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

        const sanitized = candidates.map((c, idx) => sanitizeCandidate(c, idx));
        sanitized.sort((a, b) => b.votes - a.votes);

        const totalVotes = sanitized.reduce((sum, c) => sum + c.votes, 0);
        const leadingCandidate = sanitized.length > 0 && sanitized[0].votes > 0 ? sanitized[0] : null;
        const runnerUp = sanitized.length > 1 ? sanitized[1] : null;
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
            results: sanitized,
            candidates: sanitized
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};