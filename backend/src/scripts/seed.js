const { sequelize, User, Election, Candidate } = require('../models');

async function seed() {
    try {
        // Create election if not exists
        let election = await Election.findOne({ where: { name: 'National General Election 2026' } });

        if (!election) {
            election = await Election.create({
                name: 'National General Election 2026',
                status: 'live',
                startTime: new Date(),
                endTime: new Date(Date.now() + 365 * 86400 * 1000),
                level: 'national'
            });
        } else {
            await election.update({
                name: 'National General Election 2026',
                status: 'live',
                endTime: new Date(Date.now() + 365 * 86400 * 1000)
            });
        }

        // Prominent Indian Political Leaders Candidates List
        const candidates = [
            { name: 'Narendra Modi', party: 'Bharatiya Janata Party (BJP)', symbol: '🪷', electionId: election.id, constituency: 'Varanasi', constituencyType: 'general', state: 'Uttar Pradesh' },
            { name: 'Rahul Gandhi', party: 'Indian National Congress (INC)', symbol: '✋', electionId: election.id, constituency: 'Wayanad', constituencyType: 'general', state: 'Kerala' },
            { name: 'Arvind Kejriwal', party: 'Aam Aadmi Party (AAP)', symbol: '🧹', electionId: election.id, constituency: 'New Delhi', constituencyType: 'general', state: 'Delhi' },
            { name: 'Akhilesh Yadav', party: 'Samajwadi Party (SP)', symbol: '🚲', electionId: election.id, constituency: 'Kannauj', constituencyType: 'general', state: 'Uttar Pradesh' },
            { name: 'Mayawati', party: 'Bahujan Samaj Party (BSP)', symbol: '🐘', electionId: election.id, constituency: 'Agra', constituencyType: 'general', state: 'Uttar Pradesh' },
            { name: 'Mamata Banerjee', party: 'All India Trinamool Congress (AITC)', symbol: '🌸', electionId: election.id, constituency: 'Bhabanipur', constituencyType: 'general', state: 'West Bengal' }
        ];

        for (const c of candidates) {
            const exists = await Candidate.findOne({ where: { name: c.name, electionId: c.electionId } });
            if (!exists) {
                await Candidate.create(c);
                console.log('Created candidate:', c.name, '(', c.party, ')');
            }
        }

        // Create test voters
        const voterId = 'voter1';
        let user = await User.findByPk(voterId);
        if (!user) {
            await User.create({ voterId, aadharNo: '444433336666', name: 'Manishi Sharma', email: 'manishi@voting.app', role: 'voter', gender: 'female', mobileNo: '9876543210', password: 'password123' });
            console.log('Created test voter: voter1 / password123');
        }

        const panDemoVoterId = 'TXPPS1893L';
        const panDemoVoter = await User.findByPk(panDemoVoterId);
        if (!panDemoVoter) {
            await User.create({
                voterId: panDemoVoterId,
                aadharNo: 'PAN-TXPPS1893L',
                name: 'PAN Test Voter',
                email: 'txpps1893l@voting.app',
                role: 'voter',
                gender: 'other',
                mobileNo: '9000001893',
                password: 'password123'
            });
            console.log(`Created PAN test voter: ${panDemoVoterId} / password123`);
        } else if (panDemoVoter.name === 'Demo PAN Voter') {
            await panDemoVoter.update({ name: 'PAN Test Voter' });
        }

        const voters = [
            { voterId: 'voter2', name: 'Rahul Kumar', password: '123456' },
            { voterId: 'voter3', name: 'Priya Singh', password: '123456' }
        ];

        for (const v of voters) {
            let exists = await User.findByPk(v.voterId);
            if (!exists) {
                await User.create({
                    voterId: v.voterId,
                    aadharNo: '8888' + v.voterId,
                    name: v.name,
                    email: v.voterId + '@voting.app',
                    role: 'voter',
                    gender: 'other',
                    mobileNo: '9999' + Math.floor(100000 + Math.random() * 900000),
                    password: v.password
                });
            }
        }

        // Create test admin
        const adminId = 'admin1';
        let admin = await User.findByPk(adminId);
        if (!admin) {
            await User.create({ voterId: adminId, aadharNo: '999999999999', name: 'Chief Election Admin', email: 'admin@voting.app', role: 'admin', gender: 'other', mobileNo: '9999999999', password: 'admin123' });
        }

        console.log('Seeding complete');
    } catch (err) {
        console.error('Seeding error', err);
    }
}

module.exports = { seed };

if (require.main === module) {
    seed().then(() => process.exit(0)).catch(() => process.exit(1));
}