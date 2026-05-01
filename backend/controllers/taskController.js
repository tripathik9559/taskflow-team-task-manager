// controllers/taskController.js
// full task CRUD + comments + status updates

const db = require('../config/db');
const logActivity = require('../utils/logger');

// GET /api/tasks?projectId=&status=&priority=&search=
const getTasks = async (req, res) => {
    const { projectId, status, priority, search } = req.query;

    try {
        let query = `
            SELECT t.*, 
                u1.name as assigned_to_name, 
                u2.name as created_by_name,
                p.name as project_name,
                CASE WHEN t.deadline < CURDATE() AND t.status != 'done' THEN 1 ELSE 0 END as is_overdue
            FROM tasks t
            LEFT JOIN users u1 ON t.assigned_to = u1.id
            LEFT JOIN users u2 ON t.created_by = u2.id
            LEFT JOIN projects p ON t.project_id = p.id
        `;

        const params = [];
        const conditions = [];

        // members only see their assigned tasks or tasks in their projects
        if (req.user.role !== 'admin') {
            conditions.push(`(t.assigned_to = ? OR t.project_id IN (
                SELECT project_id FROM project_members WHERE user_id = ?
            ))`);
            params.push(req.user.id, req.user.id);
        }

        if (projectId) {
            conditions.push('t.project_id = ?');
            params.push(projectId);
        }
        if (status) {
            conditions.push('t.status = ?');
            params.push(status);
        }
        if (priority) {
            conditions.push('t.priority = ?');
            params.push(priority);
        }
        if (search) {
            conditions.push('(t.title LIKE ? OR t.description LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY t.deadline ASC, t.created_at DESC';

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error('Get tasks error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/tasks - create task (admin only)
const createTask = async (req, res) => {
    const { projectId, title, description, assignedTo, deadline, priority } = req.body;

    if (!projectId || !title) {
        return res.status(400).json({ message: 'projectId and title are required' });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO tasks (project_id, title, description, assigned_to, created_by, deadline, priority)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [projectId, title, description || null, assignedTo || null, req.user.id, deadline || null, priority || 'medium']
        );

        await logActivity(req.user.id, `Created task: ${title}`, 'task', result.insertId);

        res.status(201).json({ message: 'Task created', taskId: result.insertId });
    } catch (err) {
        console.error('Create task error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/tasks/:id - update task
const updateTask = async (req, res) => {
    const taskId = req.params.id;
    const { title, description, assignedTo, deadline, priority, status } = req.body;

    try {
        const [taskRows] = await db.query('SELECT * FROM tasks WHERE id = ?', [taskId]);
        if (taskRows.length === 0) return res.status(404).json({ message: 'Task not found' });

        const task = taskRows[0];

        // members can only update status of their own tasks
        if (req.user.role !== 'admin') {
            if (task.assigned_to !== req.user.id) {
                return res.status(403).json({ message: 'You can only update tasks assigned to you' });
            }
            // member can only change status, nothing else
            await db.query('UPDATE tasks SET status = ? WHERE id = ?', [status || task.status, taskId]);
            await logActivity(req.user.id, `Updated task status to: ${status}`, 'task', taskId);
            return res.json({ message: 'Task status updated' });
        }

        // admin can update everything
        await db.query(
            `UPDATE tasks SET 
                title = COALESCE(?, title),
                description = COALESCE(?, description),
                assigned_to = ?,
                deadline = ?,
                priority = COALESCE(?, priority),
                status = COALESCE(?, status)
             WHERE id = ?`,
            [title, description, assignedTo ?? task.assigned_to, deadline ?? task.deadline, priority, status, taskId]
        );

        await logActivity(req.user.id, `Updated task: ${title || task.title}`, 'task', taskId);

        res.json({ message: 'Task updated' });
    } catch (err) {
        console.error('Update task error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// DELETE /api/tasks/:id (admin only)
const deleteTask = async (req, res) => {
    const taskId = req.params.id;
    try {
        const [check] = await db.query('SELECT id, title FROM tasks WHERE id = ?', [taskId]);
        if (check.length === 0) return res.status(404).json({ message: 'Task not found' });

        await db.query('DELETE FROM tasks WHERE id = ?', [taskId]);
        await logActivity(req.user.id, `Deleted task: ${check[0].title}`, 'task', taskId);

        res.json({ message: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/tasks/:id/comments
const getComments = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT c.*, u.name as user_name
            FROM task_comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.task_id = ?
            ORDER BY c.created_at ASC
        `, [req.params.id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/tasks/:id/comments
const addComment = async (req, res) => {
    const { comment } = req.body;
    const taskId = req.params.id;

    if (!comment) return res.status(400).json({ message: 'Comment text is required' });

    try {
        await db.query(
            'INSERT INTO task_comments (task_id, user_id, comment) VALUES (?, ?, ?)',
            [taskId, req.user.id, comment]
        );
        await logActivity(req.user.id, `Commented on task`, 'task', taskId);
        res.status(201).json({ message: 'Comment added' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getTasks, createTask, updateTask, deleteTask, getComments, addComment };
