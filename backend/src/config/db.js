const { Sequelize } = require('sequelize');
const path = require('path');

const dialect = (process.env.DB_DIALECT || '').toLowerCase();
const isVercel = Boolean(process.env.VERCEL);
const isPostgres = dialect === 'postgres' || dialect === 'postgresql' || !!process.env.DATABASE_URL || isVercel;
const isMySQL = dialect === 'mysql';
const postgresDriver = isPostgres ? require('pg') : undefined;

let sequelize;

if (isPostgres) {
    if (process.env.DATABASE_URL) {
        sequelize = new Sequelize(process.env.DATABASE_URL, {
            dialect: 'postgres',
            dialectModule: postgresDriver,
            protocol: 'postgres',
            dialectOptions: {
                ssl: process.env.DB_SSL === 'false' ? false : {
                    require: true,
                    rejectUnauthorized: false
                }
            },
            logging: false,
        });
    } else {
        sequelize = new Sequelize(
            process.env.DB_NAME || 'postgres',
            process.env.DB_USER || 'postgres',
            process.env.DB_PASS || '',
            {
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
                dialect: 'postgres',
                dialectModule: postgresDriver,
                dialectOptions: {
                    ssl: process.env.DB_SSL === 'false' ? false : {
                        require: true,
                        rejectUnauthorized: false
                    }
                },
                logging: false,
            }
        );
    }
} else if (isMySQL) {
    sequelize = new Sequelize(process.env.DB_NAME || 'Vote_Test', process.env.DB_USER || 'root', process.env.DB_PASS || '', {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
        dialect: 'mysql',
        logging: false,
    });
} else {
    const storagePath = process.env.VERCEL
        ? path.join('/tmp', 'voting.sqlite')
        : path.join(__dirname, '..', '..', 'data', 'database.sqlite');
    const fs = require('fs');
    const dir = path.dirname(storagePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: storagePath,
        logging: false,
    });
}

async function connectDB() {
    try {
        await sequelize.authenticate();
        console.log(`Connected to ${sequelize.getDialect()} database`);
    } catch (err) {
        console.error('SQL DB connection error:', err);
        throw err;
    }
}

function assertDatabaseConfig() {
    if (
        isVercel &&
        !process.env.DATABASE_URL &&
        dialect !== 'postgres' &&
        dialect !== 'postgresql'
    ) {
        const error = new Error('Vercel requires a persistent PostgreSQL database. Configure DATABASE_URL in the Vercel project settings.');
        error.code = 'DATABASE_CONFIG_MISSING';
        throw error;
    }
}

module.exports = { sequelize, connectDB, assertDatabaseConfig };