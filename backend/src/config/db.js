const { Sequelize } = require('sequelize');
const pg = require('pg');
const path = require('path');
const fs = require('fs');

function createSqliteSequelize() {
    const isVercel = !!process.env.VERCEL;
    const storagePath = isVercel
        ? path.join('/tmp', 'database.sqlite')
        : path.join(__dirname, '..', '..', 'data', 'database.sqlite');

    const dir = path.dirname(storagePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    return new Sequelize({
        dialect: 'sqlite',
        storage: storagePath,
        logging: false,
    });
}

const isVercel = Boolean(process.env.VERCEL);
const dialect = (process.env.DB_DIALECT || (isVercel ? 'postgres' : 'sqlite')).toLowerCase();
const isPostgres = dialect === 'postgres' || dialect === 'postgresql' || !!process.env.DATABASE_URL || isVercel;
const isMySQL = dialect === 'mysql';

function getDatabaseUrl() {
    const databaseUrl = process.env.DATABASE_URL;
    const poolerHost = process.env.SUPABASE_DB_POOLER_HOST;
    if (!databaseUrl || !poolerHost) return databaseUrl;

    const url = new URL(databaseUrl);
    const project = url.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/i);
    if (!project) return databaseUrl;
    if (!/^[a-z0-9-]+\.pooler\.supabase\.com$/i.test(poolerHost)) {
        throw new Error('SUPABASE_DB_POOLER_HOST must be a Supabase transaction pooler hostname.');
    }

    url.hostname = poolerHost;
    url.port = '6543';
    url.username = `postgres.${project[1]}`;
    return url.toString();
}

let sequelize;

if (isPostgres) {
    const config = process.env.DATABASE_URL ? process.env.DATABASE_URL : {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
        database: process.env.DB_NAME || 'postgres',
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASS || '',
        dialect: 'postgres',
        dialectOptions: {
            connectTimeout: 5000,
            ssl: process.env.DB_SSL === 'false' ? false : {
                require: true,
                rejectUnauthorized: false
            }
        },
        logging: false,
    };
    sequelize = process.env.DATABASE_URL
        ? new Sequelize(getDatabaseUrl(), {
            dialect: 'postgres',
            dialectModule: pg,
            dialectOptions: { connectTimeout: 5000, ssl: process.env.DB_SSL === 'false' ? false : { require: true, rejectUnauthorized: false } },
            logging: false
        })
        : new Sequelize({ ...config, dialectModule: pg });
} else if (isMySQL) {
    sequelize = new Sequelize(process.env.DB_NAME || 'Vote_Test', process.env.DB_USER || 'root', process.env.DB_PASS || '', {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
        dialect: 'mysql',
        logging: false,
    });
} else {
    sequelize = createSqliteSequelize();
}

async function connectDB() {
    if (isVercel && !process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL must be configured for Vercel deployments.');
    }

    try {
        await sequelize.authenticate();
        console.log(`✅ Connected to ${sequelize.getDialect()} database`);
    } catch (err) {
        if (isPostgres && !isVercel) {
            console.warn('⚠️ PostgreSQL unreachable. Falling back to SQLite...');
            sequelize = createSqliteSequelize();
            await sequelize.authenticate();
            console.log(`✅ Connected to fallback sqlite database`);
        } else {
            console.error('❌ SQL DB connection error:', err.message);
            throw err;
        }
    }
}

module.exports = {
    get sequelize() { return sequelize; },
    connectDB
};