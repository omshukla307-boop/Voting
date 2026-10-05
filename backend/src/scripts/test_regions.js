const { Client } = require('pg');

const regions = [
    'aws-0-us-east-1.pooler.supabase.com',
    'aws-0-us-east-2.pooler.supabase.com',
    'aws-0-us-west-1.pooler.supabase.com',
    'aws-0-us-west-2.pooler.supabase.com',
    'aws-0-ap-south-1.pooler.supabase.com',
    'aws-0-ap-southeast-1.pooler.supabase.com',
    'aws-0-ap-northeast-1.pooler.supabase.com',
    'aws-0-ap-northeast-2.pooler.supabase.com',
    'aws-0-eu-west-1.pooler.supabase.com',
    'aws-0-eu-west-2.pooler.supabase.com',
    'aws-0-eu-central-1.pooler.supabase.com',
    'aws-0-sa-east-1.pooler.supabase.com',
    'aws-0-ca-central-1.pooler.supabase.com'
];

async function run() {
    for (const host of regions) {
        const client = new Client({
            user: 'postgres.bjpprkuklwfiqqwrpxld',
            password: 'Pa7kemarfz@',
            host: host,
            port: 6543,
            database: 'postgres',
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 3000
        });

        try {
            await client.connect();
            console.log(`FOUND REGION MATCH! ${host}`);
            await client.end();
            process.exit(0);
        } catch (err) {
            if (!err.message.includes('timeout expired')) {
                console.log(`${host} responded: ${err.message}`);
            }
            await client.end().catch(() => {});
        }
    }
}

run();
