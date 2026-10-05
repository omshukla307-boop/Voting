const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const regions = [
    'aws-0-ap-south-1.pooler.supabase.com',
    'aws-0-ap-southeast-1.pooler.supabase.com',
    'aws-0-us-east-1.pooler.supabase.com',
    'aws-0-eu-central-1.pooler.supabase.com'
];

async function tryConnect(host) {
    console.log(`Testing pooler connection to ${host}...`);
    const client = new Client({
        user: 'postgres.bjpprkuklwfiqqwrpxld',
        password: 'Pa7kemarfz@',
        host: host,
        port: 6543,
        database: 'postgres',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000
    });

    try {
        await client.connect();
        console.log(`✅ SUCCESS! Connected to Supabase via ${host}:6543`);
        
        const schemaPath = path.join(__dirname, '..', '..', 'schema.sql');
        const sql = fs.readFileSync(schemaPath, 'utf8');

        console.log("Executing table creation queries in Supabase...");
        await client.query(sql);
        console.log("🎉 ALL TABLES (Users, Elections, Candidates, Votes) CREATED SUCCESSFULLY IN SUPABASE!");
        
        await client.end();
        return true;
    } catch (err) {
        console.log(`Failed on ${host}: ${err.message}`);
        await client.end().catch(() => {});
        return false;
    }
}

async function main() {
    for (const regionHost of regions) {
        const ok = await tryConnect(regionHost);
        if (ok) break;
    }
}

main();
