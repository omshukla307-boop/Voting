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

        // Create practice candidates with specified fictional names (Priority 5)
        const candidates = [
            { name: 'Aarav Mehta', party: 'People\'s Development Alliance (PDA)', symbol: '⚖️', electionId: election.id, constituency: 'Northview', constituencyType: 'general', state: 'Delhi' },
            { name: 'Priya Sharma', party: 'National Progress Front (NPF)', symbol: '🪔', electionId: election.id, constituency: 'Lake District', constituencyType: 'general', state: 'Maharashtra' },
            { name: 'Kabir Verma', party: 'Unity and Reform Party (URP)', symbol: '🌾', electionId: election.id, constituency: 'Greenfield', constituencyType: 'general', state: 'Uttar Pradesh' },
            { name: 'Ananya Rao', party: 'Democratic Future League (DFL)', symbol: '🕊️', electionId: election.id, constituency: 'Rivertown', constituencyType: 'general', state: 'Karnataka' },
            { name: 'Rohan Kapoor', party: 'People\'s Welfare Movement (PWM)', symbol: '☀️', electionId: election.id, constituency: 'Hillcrest', constituencyType: 'general', state: 'Punjab' },
            { name: 'Meera Joshi', party: 'Independent Citizens Group (ICG)', symbol: '⛵', electionId: election.id, constituency: 'Eastwood', constituencyType: 'general', state: 'Gujarat' },
            { name: 'None of the Above (NOTA)', party: 'Independent / ECI', symbol: '❌', electionId: election.id, constituency: 'All India', constituencyType: 'general', state: 'All India' }
        ];

        // Clean up old real/legacy candidate records if present
        await Candidate.destroy({ where: {} });

        for (let i = 0; i < candidates.length; i++) {
            const c = candidates[i];
            await Candidate.create({
                id: i + 1,
                ...c
            });
            console.log('Created candidate', c.name);
        }

        // Create test voters (password will be hashed by User model hook)
        const voters = [
            { voterId: 'TIS1952092', name: 'Verified Elector (TIS1952092)', aadharNo: '195209219520', email: 'tis1952092@example.com', mobileNo: '9876519520', password: 'password123' },
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