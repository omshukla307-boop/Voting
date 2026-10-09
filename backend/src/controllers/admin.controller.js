// Beginner-friendly Admin controller
// Small, clear examples for creating elections and candidates.

const { Election, Candidate, Vote, User } = require('../models');

// Create a new election (very basic)
exports.createElection = async (req, res) => {
    try {
        const { name, startTime, endTime, level, state } = req.body || {};
        if (!name || !startTime || !endTime) return res.status(400).json({ error: 'name, startTime and endTime required' });

        const election = await Election.create({ name, startTime, endTime, level: level || 'local', state: state || null });
        return res.json({ id: election.id, name: election.name });
    } catch (err) {
        console.error('createElection error', err);
        return res.status(500).json({ error: 'Could not create election' });
    }
};

// Add a candidate to an election
exports.addCandidate = async (req, res) => {
    try {
        let { electionId, name, party, symbol, constituency, constituencyType, state } = req.body || {};
        if (!name || !party) {
            return res.status(400).json({ error: 'Candidate name and Party name are required' });
        }

        if (!electionId) {
            const firstElection = await Election.findOne({ order: [['id', 'ASC']] });
            electionId = firstElection ? firstElection.id : 1;
        }

        symbol = symbol || '⚖️';
        constituency = constituency || 'General Constituency';
        constituencyType = constituencyType || 'general';
        state = state || 'All India';

        const candidate = await Candidate.create({ name, party, symbol, electionId, constituency, constituencyType, state });
        return res.json({ success: true, message: 'Candidate and Party added successfully', candidate });
    } catch (err) {
        console.error('addCandidate error', err);
        return res.status(500).json({ error: 'Could not add candidate' });
    }
};

// Simple summary: return all elections (starter example)
exports.getSummary = async (req, res) => {
    try {
        const elections = await Election.findAll();
        return res.json({ elections });
    } catch (err) {
        console.error('getSummary error', err);
        return res.status(500).json({ error: 'Could not fetch summary' });
    }
};

// =============================
// GET DYNAMIC ELECTION STATUS
// =============================
exports.getElectionStatus = async (req, res) => {
    try {
        const election = await Election.findOne({
            order: [['createdAt', 'DESC']]
        });

        if (!election) {
            return res.json({ status: "none" });
        }

        const now = new Date();
        let currentStatus = "upcoming";

        // Compare current server time against the database timestamps
        if (now >= election.startTime && now <= election.endTime) {
            currentStatus = "live";
        } else if (now > election.endTime) {
            currentStatus = "completed";
        }

        return res.json({ status: currentStatus });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// =============================
// GET LIVE AUDIT VOTES LEDGER
// =============================
exports.getLiveVotes = async (req, res) => {
    try {
        const votes = await Vote.findAll({
            order: [['createdAt', 'DESC']],
            limit: 100,
            include: [
                { model: Candidate, attributes: ['id', 'name', 'party'] },
                { model: User, attributes: ['voterId', 'name'] }
            ]
        });

        const formattedVotes = votes.map(vote => ({
            id: vote.id,
            voterId: vote.voterId || (vote.User ? vote.User.voterId : 'N/A'),
            walletAddress: vote.walletAddress || 'N/A',
            candidateName: vote.Candidate ? vote.Candidate.name : `Candidate #${vote.candidateId}`,
            candidateParty: vote.Candidate ? vote.Candidate.party : '',
            voteHash: vote.voteHash || 'N/A',
            timeStamp: vote.createdAt || vote.timeStamp
        }));

        return res.json({ success: true, votes: formattedVotes });
    } catch (err) {
        console.error('getLiveVotes error', err);
        return res.status(500).json({ error: 'Could not fetch live votes' });
    }
};