const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const targets = [
    { host: 'aws-0-ap-south-1.pooler.supabase.com', port: 6543, user: 'postgres.bjpprkuklwfiqqwrpxld' },
    { host: 'aws-0-ap-south-1.pooler.supabase.com', port: 5432, user: 'postgres.bjpprkuklwfiqqwrpxld' },
    { host: 'aws-0-ap-southeast-1.pooler.supabase.com', port: 6543, user: 'postgres.bjpprkuklwfiqqwrpxld' },
    { host: 'aws-0-ap-southeast-1.pooler.supabase.com', port: 5432, user: 'postgres.bjpprkuklwfiqqwrpxld' },
    { host: 'db.bjpprkuklwfiqqwrpxld.supabase.co', port: 5432, user: 'postgres' },
    { host: 'db.bjpprkuklwfiqqwrpxld.supabase.co', port: 6543, user: 'postgres.bjpprkuklwfiqqwrpxld' }
];

async function run() {
    for (const t of targets) {
        console.log(`Connecting to ${t.user}@${t.host}:${t.port}...`);
        const client = new Client({
            user: t.user,
            password: 'Pa7kemarfz@',
            host: t.host,
            port: t.port,
            database: 'postgres',
            ssl: {
                rejectUnauthorized: false,
                servername: t.host
            },
            connectionTimeoutMillis: 5000
        });

        try {
            await client.connect();
            console.log(`🎉 SUCCESS! Connected to Supabase via ${t.host}:${t.port}!`);
            
            const schemaPath = path.join(__dirname, '..', '..', 'schema.sql');
            const sql = fs.readFileSync(schemaPath, 'utf8');

            console.log("Executing table creation queries in Supabase...");
            await client.query(sql);
            console.log("✅ ALL TABLES (Users, Elections, Candidates, Votes) CREATED SUCCESSFULLY IN SUPABASE!");
            
            await client.end();
            process.exit(0);
        } catch (err) {
            console.log(`Failed on ${t.host}:${t.port}: ${err.message}`);
            await client.end().catch(() => {});
        }
    }
}

run();
