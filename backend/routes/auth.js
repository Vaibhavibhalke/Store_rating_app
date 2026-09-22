const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { signupValidation, loginValidation, updatePasswordValidation, validate } = require('../middleware/validation');

router.post('/signup', signupValidation, validate, async (req, res) => {
    try {
        const { name, email, password, address } = req.body;

        const [existingUser] = await db.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, address || null, 'normal_user']
        );

        const token = jwt.sign(
            { id: result.insertId, email, role: 'normal_user' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: result.insertId,
                name,
                email,
                address,
                role: 'normal_user'
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Server error during signup' });
    }
});

router.post('/login', loginValidation, validate, async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await db.query(
            'SELECT id, name, email, password, address, role FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                address: user.address,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

router.put('/password', updatePasswordValidation, validate, async (req, res) => {
    try {
        const { newPassword } = req.body;
        const userId = req.user.id;

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, userId]
        );

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Password update error:', error);
        res.status(500).json({ error: 'Server error during password update' });
    }
});

module.exports = router;
