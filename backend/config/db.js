// db.js - MySQL connection pool setup
// keeping a pool is better than single connection - handles multiple requests

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'taskmanager_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// quick test to see if db is reachable
pool.getConnection()
    .then(conn => {
        console.log('MySQL connected successfully');
        conn.release();
    })
    .catch(err => {
        console.error('MySQL connection error:', err.message);
    });

module.exports = pool;
