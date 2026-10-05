const fs = require('fs');
const path = require('path');
require('dotenv').config();

const url = process.env.SUPABASE_URL || 'https://bjpprkuklwfiqqwrpxld.supabase.co';
const secretKey = process.env.SUPABASE_SECRET_KEY;

async function tryExecSql() {
    const schemaPath = path.join(__dirname, '..', '..', 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log("Attempting to send SQL schema to Supabase management API...");

    // Try Management API / pg endpoint
    const endpoints = [
        { uri: `${url}/rest/v1/rpc/exec_sql`, method: 'POST', body: { query: sql } },
        { uri: `${url}/pg/query`, method: 'POST', body: { query: sql } }
    ];

    for (const ep of endpoints) {
        try {
            const res = await fetch(ep.uri, {
                method: ep.method,
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': secretKey,
                    'Authorization': `Bearer ${secretKey}`
                },
                body: JSON.stringify(ep.body)
            });
            const text = await res.text();
            console.log(`Endpoint ${ep.uri} status: ${res.status}`);
            console.log(`Response: ${text}`);
            if (res.status === 200 || res.status === 201) {
                console.log("🎉 SUCCESS! Tables created successfully!");
                return;
            }
        } catch (e) {
            console.log(`Error calling ${ep.uri}: ${e.message}`);
        }
    }
}

tryExecSql();
