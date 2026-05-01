// controllers/dashboardController.js
// aggregated stats for the dashboard page

const db = require('../config/db');

// GET /api/dashboard
const getDashboard = async (req, res) => {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    try {
        let taskFilter = isAdmin ? '' : 'AND (t.assigned_to = ? OR t.project_id IN (SELECT project_id FROM project_members WHERE user_id = ?))';
        let filterParams = isAdmin ? [] : [userId, userId];

        // total task counts by status
        const [statusCounts] = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END) as todo,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
                SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as done,
                SUM(CASE WHEN deadline < CURDATE() AND status != 'done' THEN 1 ELSE 0 END) as overdue
            FROM tasks t
            WHERE 1=1 ${taskFilter}
        `, filterParams);

        // overdue tasks list
        const [overdueTasks] = await db.query(`
            SELECT t.id, t.title, t.deadline, t.priority, t.status,
                u.name as assigned_to_name, p.name as project_name
            FROM tasks t
            LEFT JOIN users u ON t.assigned_to = u.id
            LEFT JOIN projects p ON t.project_id = p.id
            WHERE t.deadline < CURDATE() AND t.status != 'done' ${taskFilter}
            ORDER BY t.deadline ASC
            LIMIT 10
        `, filterParams);

        // tasks per project with progress
        const projectFilter = isAdmin
            ? ''
            : 'WHERE p.id IN (SELECT project_id FROM project_members WHERE user_id = ?)';
        const projectParams = isAdmin ? [] : [userId];

        const [projectStats] = await db.query(`
            SELECT p.id, p.name,
                COUNT(t.id) as total_tasks,
                SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) as done_tasks
            FROM projects p
            LEFT JOIN tasks t ON t.project_id = p.id
            ${projectFilter}
            GROUP BY p.id, p.name
            ORDER BY p.name
        `, projectParams);

        // recent activity (last 10 entries)
        const activityFilter = isAdmin ? '' : 'WHERE a.user_id = ?';
        const activityParams = isAdmin ? [] : [userId];
        const [recentActivity] = await db.query(`
            SELECT a.action, a.created_at, u.name as user_name
            FROM activity_log a
            JOIN users u ON a.user_id = u.id
            ${activityFilter}
            ORDER BY a.created_at DESC
            LIMIT 10
        `, activityParams);

        // total users count (admin only)
        let totalUsers = null;
        if (isAdmin) {
            const [[countRow]] = await db.query('SELECT COUNT(*) as count FROM users');
            totalUsers = countRow.count;
        }

        res.json({
            stats: statusCounts[0],
            overdueTasks,
            projectStats,
            recentActivity,
            totalUsers
        });
    } catch (err) {
        console.error('Dashboard error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/dashboard/users - for admin to see all users (for task assignment etc)
const getAllUsers = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, name, email, role, created_at FROM users ORDER BY name');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/dashboard/activity
const getActivityLog = async (req, res) => {
    try {
        const isAdmin = req.user.role === 'admin';
        const params = isAdmin ? [] : [req.user.id];
        const whereClause = isAdmin ? '' : 'WHERE a.user_id = ?';

        const [rows] = await db.query(`
            SELECT a.*, u.name as user_name
            FROM activity_log a
            JOIN users u ON a.user_id = u.id
            ${whereClause}
            ORDER BY a.created_at DESC
            LIMIT 50
        `, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getDashboard, getAllUsers, getActivityLog };
