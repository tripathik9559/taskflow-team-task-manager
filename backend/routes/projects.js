// routes/projects.js
const express = require('express');
const router = express.Router();
const { verifyToken, adminOnly } = require('../middleware/auth');
const {
    getProjects, createProject, updateProject, deleteProject,
    addMember, removeMember, getMembers
} = require('../controllers/projectController');

router.get('/', verifyToken, getProjects);
router.post('/', verifyToken, adminOnly, createProject);
router.put('/:id', verifyToken, adminOnly, updateProject);
router.delete('/:id', verifyToken, adminOnly, deleteProject);

router.get('/:id/members', verifyToken, getMembers);
router.post('/:id/members', verifyToken, adminOnly, addMember);
router.delete('/:id/members/:userId', verifyToken, adminOnly, removeMember);

module.exports = router;
