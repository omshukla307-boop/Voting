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

        // Create practice candidates with fake names
        const candidates = [
            { name: 'Rajesh Sharma', party: 'Progressive Democratic Alliance (PDA)', symbol: '⚖️', electionId: election.id, constituency: 'Varanasi / Central', constituencyType: 'general', state: 'Uttar Pradesh' },
            { name: 'Vikramaditya Verma', party: 'National Unity Front (NUF)', symbol: '🪔', electionId: election.id, constituency: 'Wayanad / South', constituencyType: 'general', state: 'Kerala' },
            { name: 'Ananya Sen', party: 'People\'s Welfare Party (PWP)', symbol: '🌾', electionId: election.id, constituency: 'New Delhi / Capital', constituencyType: 'general', state: 'Delhi' },
            { name: 'David D\'Souza', party: 'Federal Reform Movement (FRM)', symbol: '🕊️', electionId: election.id, constituency: 'Kolkata / East', constituencyType: 'general', state: 'West Bengal' },
            { name: 'Sunita Chaudhary', party: 'Secular Citizens Alliance (SCA)', symbol: '☀️', electionId: election.id, constituency: 'Chennai / Metro', constituencyType: 'general', state: 'Tamil Nadu' },
            { name: 'Tariq Ahmad Khan', party: 'United National Coalition (UNC)', symbol: '⛵', electionId: election.id, constituency: 'Baramati / West', constituencyType: 'general', state: 'Maharashtra' },
            { name: 'None of the Above (NOTA)', party: 'Independent / ECI', symbol: '❌', electionId: election.id, constituency: 'National / All', constituencyType: 'general', state: 'All India' }
        ];

        // Clean up old real candidate records if present
        await Candidate.destroy({ where: { electionId: election.id } });

        for (const c of candidates) {
            await Candidate.create(c);
            console.log('Created candidate', c.name);
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