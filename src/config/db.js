require('dotenv').config();
const sql = require("mssql");
// var sql = require("msnodesqlv8");

const config = {
    server: process.env.DB_SERVER,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_CERT === 'true'
    },

    driver: process.env.DB_DRIVER,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

// const conn = sql.connect(config)
//     .then(pool => {
//         console.log("✓ Connected to SQL Server!");
//         return pool;
//     })
//     .catch(err => {
//         console.log("Connection Error:", err);
//     });

// module.exports = {
//     conn: conn,
//     sql: sql
// }

let pool; //  singleton

async function connectDB() {
    if (pool) return pool; // đã có pool thì dùng lại

    try {
        pool = await sql.connect(config);
        console.log(' MSSQL connected');
        return pool;
    } catch (err) {
        console.error(' MSSQL connection failed:', err);
        throw err;
    }
}

//  đóng pool gọn sạch
async function closeDB() {
    if (pool) {
        await pool.close();
        console.log(' MSSQL pool closed');
        pool = null;
    }
}

module.exports = {
    sql,
    connectDB,
    closeDB
};