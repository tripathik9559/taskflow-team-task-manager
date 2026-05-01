// db.js - MySQL connection pool setup
// keeping a pool is better than single connection - handles multiple requests

const mysql = require('mysql2/promise');

let pool;

// Check if DATABASE_URL exists (Railway deployment)
if (process.env.DATABASE_URL) {
    // Parse DATABASE_URL format: mysql://user:password@host:port/database
    const url = new URL(process.env.DATABASE_URL);
    
    pool = mysql.createPool({
        host: url.hostname,
        port: url.port || 3306,
        user: url.username,
        password: url.password,
        database: url.pathname.slice(1), // Remove leading '/'
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
    
    console.log('Using DATABASE_URL for connection');
} else {
    // Fallback to individual environment variables (local development)
    pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'taskmanager_db',
        port: process.env.DB_PORT || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
    
    console.log('Using individual DB variables for connection');
}

// Quick test to see if db is reachable
pool.getConnection()
    .then(conn => {
        console.log('MySQL connected successfully');
        conn.release();
    })
    .catch(err => {
        console.error('MySQL connection error:', err.message);
    });

module.exports = pool;