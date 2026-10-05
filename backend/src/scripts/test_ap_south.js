const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const host = 'aws-0-ap-south-1.pooler.supabase.com';

const combos = [
    { user: 'postgres.bjpprkuklwfiqqwrpxld', port: 5432 },
    { user: 'postgres', port: 5432 },
    { user: 'postgres.bjpprkuklwfiqqwrpxld', port: 6543 },
    { user: 'postgres', port: 6543 }
];

async function run() {
    for (const item of combos) {
        console.log(`Trying ${item.user} @ ${host}:${item.port}...`);
        const client = new Client({
            user: item.user,
            password: 'Pa7kemarfz@',
            host: host,
            port: item.port,
            database: 'postgres',
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 4000
        });

        try {
            await client.connect();
            console.log(`🎉 SUCCESS! Connected using user: ${item.user}, port: ${item.port}`);
            
            const schemaPath = path.join(__dirname, '..', '..', 'schema.sql');
            const sql = fs.readFileSync(schemaPath, 'utf8');

            console.log("Executing table creation queries in Supabase...");
            await client.query(sql);
            console.log("✅ ALL TABLES (Users, Elections, Candidates, Votes) CREATED SUCCESSFULLY IN SUPABASE!");
            
            await client.end();
            process.exit(0);
        } catch (err) {
            console.log(`Error: ${err.message}`);
            await client.end().catch(() => {});
        }
    }
}

run();
