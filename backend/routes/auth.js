const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Login endpoint
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const [rows] = await db.query(
            'SELECT username, role FROM users WHERE username = ? AND password = ?',
            [username, password]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        res.json({ user: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
