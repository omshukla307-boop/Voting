const net = require('net');

const hosts = [
    { host: 'db.bjpprkuklwfiqqwrpxld.supabase.co', port: 5432 },
    { host: 'db.bjpprkuklwfiqqwrpxld.supabase.co', port: 6543 },
    { host: 'aws-0-ap-south-1.pooler.supabase.com', port: 6543 },
    { host: 'aws-0-us-east-1.pooler.supabase.com', port: 6543 },
    { host: 'aws-0-eu-central-1.pooler.supabase.com', port: 6543 },
    { host: 'aws-0-us-west-1.pooler.supabase.com', port: 6543 }
];

async function checkPort(host, port) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(3000);
        socket.on('connect', () => {
            console.log(`SUCCESS: ${host}:${port} is reachable!`);
            socket.destroy();
            resolve(true);
        });
        socket.on('timeout', () => {
            console.log(`TIMEOUT: ${host}:${port}`);
            socket.destroy();
            resolve(false);
        });
        socket.on('error', (err) => {
            console.log(`ERROR: ${host}:${port} - ${err.message}`);
            socket.destroy();
            resolve(false);
        });
        socket.connect(port, host);
    });
}

async function run() {
    for (const item of hosts) {
        await checkPort(item.host, item.port);
    }
}

run();
