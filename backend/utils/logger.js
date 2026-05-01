// utils/logger.js
// simple helper to log user actions to activity_log table

const db = require('../config/db');

const logActivity = async (userId, action, entityType = null, entityId = null) => {
    try {
        await db.query(
            'INSERT INTO activity_log (user_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?)',
            [userId, action, entityType, entityId]
        );
    } catch (err) {
        // log error but don't break the main flow
        console.error('Activity log error:', err.message);
    }
};

module.exports = logActivity;
