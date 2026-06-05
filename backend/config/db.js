// db.js - MySQL connection pool setup
const mysql = require('mysql2/promise');

let pool;

if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    pool = mysql.createPool({
        host: url.hostname,
        port: url.port || 3306,
        user: url.username,
        password: url.password,
        database: url.pathname.slice(1),
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
    console.log('Using DATABASE_URL for connection');
} else {
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

pool.getConnection()
    .then(conn => {
        console.log('MySQL connected successfully');
        conn.release();
        initDB();
    })
    .catch(err => {
        console.error('MySQL connection error:', err.message);
    });

const initDB = async () => {
    try {
        await pool.query(`CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role ENUM('Admin','Manager','Member') DEFAULT 'Member',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await pool.query(`CREATE TABLE IF NOT EXISTS projects (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            status VARCHAR(50) DEFAULT 'active',
            created_by INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await pool.query(`CREATE TABLE IF NOT EXISTS tasks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            status VARCHAR(50) DEFAULT 'todo',
            priority VARCHAR(50) DEFAULT 'medium',
            project_id INT,
            assigned_to INT,
            created_by INT,
            due_date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await pool.query(`CREATE TABLE IF NOT EXISTS comments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            task_id INT,
            user_id INT,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await pool.query(`CREATE TABLE IF NOT EXISTS project_members (
            project_id INT,
            user_id INT,
            PRIMARY KEY (project_id, user_id)
        )`);
        // Migration fixes
        await pool.query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deadline DATE`).catch(() => {});
        await pool.query(`CREATE TABLE IF NOT EXISTS activity_log (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            action VARCHAR(255) NOT NULL,
            entity_type VARCHAR(50),
            entity_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`).catch(() => {});
        console.log('Database tables ready');

        // Seed demo accounts — INSERT IGNORE for new DBs, UPDATE for existing
        // Password: TaskFlow@2025
        await pool.query(`
            INSERT IGNORE INTO users (name, email, password, role) VALUES
            ('Demo Admin', 'demo_admin@example.com', '$2a$10$KbT2uWhYaKLhpkP4EEhxXOMM48yZRNcDD7Gc5BjVhUDcTG/Py4IPy', 'admin'),
            ('Demo User',  'demo_user@example.com',  '$2a$10$2WSK2CMl30.JIXbwJ1c/qe5MftN21kLuSEVQ/LrVX2nJQwVPYAq3y',  'member')
        `).catch(() => {});
        await pool.query(
            "UPDATE users SET password = ?, role = 'admin' WHERE email = 'demo_admin@example.com'",
            ['$2a$10$KbT2uWhYaKLhpkP4EEhxXOMM48yZRNcDD7Gc5BjVhUDcTG/Py4IPy']
        ).catch(() => {});
        await pool.query(
            "UPDATE users SET password = ?, role = 'member' WHERE email = 'demo_user@example.com'",
            ['$2a$10$2WSK2CMl30.JIXbwJ1c/qe5MftN21kLuSEVQ/LrVX2nJQwVPYAq3y']
        ).catch(() => {});
        console.log('Demo accounts ready — demo_admin@example.com / demo_user@example.com (password: TaskFlow@2025)');
    } catch (err) {
        console.error('DB init error:', err.message);
    }
};

module.exports = pool;