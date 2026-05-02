// controllers/projectController.js
// CRUD for projects + member management

const db = require('../config/db');
const logActivity = require('../utils/logger');

// GET /api/projects - list projects accessible to user
const getProjects = async (req, res) => {
    try {
        let rows;
        if (req.user.role === 'admin') {
            // admin sees all projects
            [rows] = await db.query(`
                SELECT p.*, u.name as creator_name,
                    COUNT(DISTINCT pm.user_id) as member_count,
                    COUNT(DISTINCT t.id) as task_count
                FROM projects p
                LEFT JOIN users u ON p.created_by = u.id
                LEFT JOIN project_members pm ON pm.project_id = p.id
                LEFT JOIN tasks t ON t.project_id = p.id
                GROUP BY p.id
                ORDER BY p.created_at DESC
            `);
        } else {
            // member sees only their projects
            [rows] = await db.query(`
                SELECT p.*, u.name as creator_name,
                    COUNT(DISTINCT pm2.user_id) as member_count,
                    COUNT(DISTINCT t.id) as task_count
                FROM projects p
                JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = ?
                LEFT JOIN users u ON p.created_by = u.id
                LEFT JOIN project_members pm2 ON pm2.project_id = p.id
                LEFT JOIN tasks t ON t.project_id = p.id
                GROUP BY p.id
                ORDER BY p.created_at DESC
            `, [req.user.id]);
        }
        res.json(rows);
    } catch (err) {
        console.error('Get projects error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/projects - create project (admin only)
const createProject = async (req, res) => {
    const { name, description } = req.body;

    if (!name) return res.status(400).json({ message: 'Project name is required' });

    try {
        const [result] = await db.query(
            'INSERT INTO projects (name, description, created_by) VALUES (?, ?, ?)',
            [name, description || null, req.user.id]
        );

        // auto-add creator as member too
        await db.query(
            'INSERT IGNORE INTO project_members (project_id, user_id) VALUES (?, ?)',
            [result.insertId, req.user.id]
        );

        await logActivity(req.user.id, `Created project: ${name}`, 'project', result.insertId);

        res.status(201).json({ message: 'Project created', projectId: result.insertId });
    } catch (err) {
        console.error('Create project error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/projects/:id - update project (admin only)
const updateProject = async (req, res) => {
    const { name, description } = req.body;
    const projectId = req.params.id;

    if (!name) return res.status(400).json({ message: 'Project name is required' });

    try {
        const [check] = await db.query('SELECT id FROM projects WHERE id = ?', [projectId]);
        if (check.length === 0) return res.status(404).json({ message: 'Project not found' });

        await db.query(
            'UPDATE projects SET name = ?, description = ? WHERE id = ?',
            [name, description || null, projectId]
        );

        await logActivity(req.user.id, `Updated project: ${name}`, 'project', projectId);

        res.json({ message: 'Project updated' });
    } catch (err) {
        console.error('Update project error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// DELETE /api/projects/:id (admin only)
const deleteProject = async (req, res) => {
    const projectId = req.params.id;
    try {
        const [check] = await db.query('SELECT id, name FROM projects WHERE id = ?', [projectId]);
        if (check.length === 0) return res.status(404).json({ message: 'Project not found' });

        await db.query('DELETE FROM projects WHERE id = ?', [projectId]);
        await logActivity(req.user.id, `Deleted project: ${check[0].name}`, 'project', projectId);

        res.json({ message: 'Project deleted' });
    } catch (err) {
        console.error('Delete project error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/projects/:id/members - add member to project (admin only)
const addMember = async (req, res) => {
    const { userId } = req.body;
    const projectId = req.params.id;

    if (!userId) return res.status(400).json({ message: 'userId is required' });

    try {
        const [user] = await db.query('SELECT id, name FROM users WHERE id = ?', [userId]);
        if (user.length === 0) return res.status(404).json({ message: 'User not found' });

        await db.query(
            'INSERT IGNORE INTO project_members (project_id, user_id) VALUES (?, ?)',
            [projectId, userId]
        );

        await logActivity(req.user.id, `Added ${user[0].name} to project`, 'project', projectId);

        res.json({ message: 'Member added to project' });
    } catch (err) {
        console.error('Add member error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// DELETE /api/projects/:id/members/:userId - remove member
const removeMember = async (req, res) => {
    const { id: projectId, userId } = req.params;
    try {
        await db.query(
            'DELETE FROM project_members WHERE project_id = ? AND user_id = ?',
            [projectId, userId]
        );
        await logActivity(req.user.id, `Removed member from project`, 'project', projectId);
        res.json({ message: 'Member removed' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/projects/:id/members
const getMembers = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT u.id, u.name, u.email, u.role
            FROM project_members pm
            JOIN users u ON pm.user_id = u.id
            WHERE pm.project_id = ?
        `, [req.params.id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getProjects, createProject, updateProject, deleteProject, addMember, removeMember, getMembers };
