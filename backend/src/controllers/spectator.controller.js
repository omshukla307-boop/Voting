// backend/src/controllers/spectator.controller.js
const { Candidate, Election, User } = require("../models");
const { Op } = require("sequelize");

async function findActiveElection() {
    const now = new Date();
    return Election.findOne({
        where: {
            [Op.or]: [
                { status: "live" },
                {
                    startTime: { [Op.lte]: now },
                    endTime: { [Op.gte]: now }
                }
            ]
        },
        order: [["startTime", "DESC"], ["id", "DESC"]]
    });
}

exports.getCandidates = async (req, res) => {
    try {
        const election = await findActiveElection();
        const candidates = election
            ? await Candidate.findAll({
                where: { electionId: election.id },
                order: [["voteCount", "DESC"]]
            })
            : [];
        return res.status(200).json({
            success: true,
            election: election ? { id: election.id, name: election.name } : null,
            candidates
        });
    } catch (error) {
        console.error("Candidate lookup failed:", error);
        return res.status(500).json({ error: "Could not load candidates for the active election." });
    }
};

exports.getLiveResults = async (req, res) => {
    try {
        const election = await findActiveElection();

        if (!election) {
            return res.status(200).json({ success: true, election: null, candidates: [] });
        }

        const candidates = await Candidate.findAll({
            where: { electionId: election.id },
            order: [["voteCount", "DESC"]]
        });
        return res.status(200).json({
            success: true,
            election: { id: election.id, name: election.name },
            candidates
        });
    } catch (error) {
        console.error("Live results lookup failed:", error);
        return res.status(500).json({ error: "Could not load live election results." });
    }
};

exports.getFinalResults = async (req, res) => {
    try {
        const election = await findActiveElection();
        const candidates = election
            ? await Candidate.findAll({
                where: { electionId: election.id },
                order: [["voteCount", "DESC"]]
            })
            : [];

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
            election: election ? { id: election.id, name: election.name } : null,
            results,
            totalVoters // Send the real count back to the frontend
        });
    } catch (error) {
        console.error("Final results lookup failed:", error);
        return res.status(500).json({ error: "Could not load results for the active election." });
    }
};