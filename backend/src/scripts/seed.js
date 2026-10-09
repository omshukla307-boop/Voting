const { sequelize, User, Election, Candidate } = require('../models');

async function seed() {
    try {
        // Do NOT call sequelize.sync() here. Server already syncs tables.

        // Create election if not exists
        let election = await Election.findOne({ where: { name: 'Demo Election' } });

        if (!election) {
            election = await Election.create({
                name: 'Demo Election',
                status: 'live',
                startTime: new Date(),
                endTime: new Date(Date.now() + 3600 * 1000),
                level: 'local'
            });
        } else {
            await election.update({
                status: 'live'
            });
        }

        // Create candidates with Indian Political Leaders
        const candidates = [
            { name: 'Narendra Modi', party: 'Bharatiya Janata Party (BJP)', symbol: '🪷', electionId: election.id, constituency: 'Varanasi / National', constituencyType: 'general', state: 'Uttar Pradesh' },
            { name: 'Rahul Gandhi', party: 'Indian National Congress (INC)', symbol: '✋', electionId: election.id, constituency: 'Wayanad / National', constituencyType: 'general', state: 'Kerala' },
            { name: 'Arvind Kejriwal', party: 'Aam Aadmi Party (AAP)', symbol: '🧹', electionId: election.id, constituency: 'New Delhi / National', constituencyType: 'general', state: 'Delhi' },
            { name: 'Mamata Banerjee', party: 'All India Trinamool Congress (AITC)', symbol: '🌺', electionId: election.id, constituency: 'Kolkata / State', constituencyType: 'general', state: 'West Bengal' },
            { name: 'M. K. Stalin', party: 'Dravida Munnetra Kazhagam (DMK)', symbol: '🌅', electionId: election.id, constituency: 'Chennai / State', constituencyType: 'general', state: 'Tamil Nadu' },
            { name: 'Sharad Pawar', party: 'Nationalist Congress Party (NCP)', symbol: '⏰', electionId: election.id, constituency: 'Baramati / State', constituencyType: 'general', state: 'Maharashtra' },
        ];

        for (const c of candidates) {
            const exists = await Candidate.findOne({ where: { name: c.name, electionId: c.electionId } });
            if (!exists) {
                await Candidate.create(c);
                console.log('Created candidate', c.name);
            } else {
                await exists.update({ party: c.party, symbol: c.symbol, constituency: c.constituency, state: c.state });
            }
        }

        // Create test voters (password will be hashed by User model hook)
        const voters = [
            { voterId: 'TXPPS1893L', name: 'Demo Voter (TXPPS1893L)', aadharNo: '999988887777', email: 'txpps1893l@example.com', mobileNo: '9876543210', password: 'password123' },
            { voterId: 'voter1', name: 'Test Voter 1', aadharNo: '000000000001', email: 'voter1@example.com', mobileNo: '9000000001', password: 'password123' },
            { voterId: 'voter2', name: 'Test Voter 2', aadharNo: '000000000002', email: 'voter2@example.com', mobileNo: '9000000002', password: '123456' },
            { voterId: 'voter3', name: 'Test Voter 3', aadharNo: '000000000003', email: 'voter3@example.com', mobileNo: '9000000003', password: '123456' },
            { voterId: 'voter4', name: 'Test Voter 4', aadharNo: '000000000004', email: 'voter4@example.com', mobileNo: '9000000004', password: '123456' }
        ];

        for (const v of voters) {
            let exists = await User.findByPk(v.voterId);
            if (!exists) {
                await User.create({
                    voterId: v.voterId,
                    aadharNo: v.aadharNo,
                    name: v.name,
                    email: v.email,
                    role: 'voter',
                    gender: 'other',
                    mobileNo: v.mobileNo,
                    password: v.password
                });
                console.log(`Created test voter: ${v.voterId} / ${v.password}`);
            }
        }

        // Create a test admin
        const adminId = 'admin1';
        let admin = await User.findByPk(adminId);
        if (!admin) {
            await User.create({ voterId: adminId, aadharNo: '999999999999', name: 'Test Admin', email: 'admin@example.com', role: 'admin', gender: 'other', mobileNo: '9999999999', password: 'admin123' });
            console.log('Created test admin: admin1 / admin123');
        }

        console.log('Seeding complete');
    } catch (err) {
        console.error('Seeding error', err);
    }
}

module.exports = { seed };

// If script is run directly, seed (useful for manual runs)
if (require.main === module) {
    seed().then(() => process.exit(0)).catch(() => process.exit(1));
}