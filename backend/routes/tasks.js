// routes/tasks.js
const express = require('express');
const router = express.Router();
const { verifyToken, adminOnly } = require('../middleware/auth');
const {
    getTasks, createTask, updateTask, deleteTask,
    getComments, addComment
} = require('../controllers/taskController');

router.get('/', verifyToken, getTasks);
router.post('/', verifyToken, adminOnly, createTask);
router.put('/:id', verifyToken, updateTask);
router.delete('/:id', verifyToken, adminOnly, deleteTask);

router.get('/:id/comments', verifyToken, getComments);
router.post('/:id/comments', verifyToken, addComment);

module.exports = router;
