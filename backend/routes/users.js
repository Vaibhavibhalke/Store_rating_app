const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { auth } = require('../middleware/auth');
const { updatePasswordValidation, validate } = require('../middleware/validation');

router.get('/profile', auth, async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, name, email, address, role FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Server error fetching profile' });
    }
});

router.put('/password', auth, updatePasswordValidation, validate, async (req, res) => {
    try {
        const { newPassword } = req.body;
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, req.user.id]
        );

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Password update error:', error);
        res.status(500).json({ error: 'Server error during password update' });
    }
});

module.exports = router;
