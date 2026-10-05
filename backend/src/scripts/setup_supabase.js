// Script to run schema.sql against Supabase PostgreSQL DB
require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runSetup() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString || connectionString.includes('your-project-ref')) {
        console.error("Error: DATABASE_URL is not set or contains placeholders in .env file.");
        console.error("Please add your real Supabase connection string to .env file as DATABASE_URL.");
        process.exit(1);
    }

    const client = new Client({
        connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log("Connecting to Supabase PostgreSQL...");
        await client.connect();
        console.log("Connected successfully!");

        const schemaPath = path.join(__dirname, '..', '..', 'schema.sql');
        const sql = fs.readFileSync(schemaPath, 'utf8');

        console.log("Executing table creation queries in Supabase...");
        await client.query(sql);
        console.log("✅ All tables (Users, Elections, Candidates, Votes) created successfully in Supabase!");

        await client.end();
    } catch (err) {
        console.error("❌ Error executing SQL in Supabase:", err.message);
        process.exit(1);
    }
}

runSetup();
