const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { adminAuth } = require('../middleware/auth');
const { addUserValidation, storeValidation, validate } = require('../middleware/validation');

router.get('/dashboard', adminAuth, async (req, res) => {
    try {
        const [totalUsers] = await db.query('SELECT COUNT(*) as count FROM users');
        
        const [totalStores] = await db.query('SELECT COUNT(*) as count FROM stores');
        
        const [totalRatings] = await db.query('SELECT COUNT(*) as count FROM ratings');

        res.json({
            totalUsers: totalUsers[0].count,
            totalStores: totalStores[0].count,
            totalRatings: totalRatings[0].count
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Server error fetching dashboard data' });
    }
});

router.post('/users', adminAuth, addUserValidation, validate, async (req, res) => {
    try {
        const { name, email, password, address, role } = req.body;

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
            [name, email, hashedPassword, address || null, role]
        );

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: result.insertId,
                name,
                email,
                address,
                role
            }
        });
    } catch (error) {
        console.error('Add user error:', error);
        res.status(500).json({ error: 'Server error adding user' });
    }
});

router.get('/users', adminAuth, async (req, res) => {
    try {
        const { name, email, address, role, sortBy = 'name', sortOrder = 'ASC' } = req.query;

        let query = `
            SELECT u.id, u.name, u.email, u.address, u.role,
                   COALESCE(AVG(r.rating), 0) as average_rating
            FROM users u
            LEFT JOIN stores s ON u.id = s.owner_id
            LEFT JOIN ratings r ON s.id = r.store_id
            WHERE 1=1
        `;
        const params = [];

        if (name) {
            query += ' AND u.name LIKE ?';
            params.push(`%${name}%`);
        }

        if (email) {
            query += ' AND u.email LIKE ?';
            params.push(`%${email}%`);
        }

        if (address) {
            query += ' AND u.address LIKE ?';
            params.push(`%${address}%`);
        }

        if (role) {
            query += ' AND u.role = ?';
            params.push(role);
        }

        query += ' GROUP BY u.id, u.name, u.email, u.address, u.role';

        const allowedSortFields = ['name', 'email', 'address', 'role'];
        const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'name';
        const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        query += ` ORDER BY u.${sortField} ${order}`;

        const [users] = await db.query(query, params);

        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Server error fetching users' });
    }
});

router.get('/users/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const [users] = await db.query(
            `SELECT u.id, u.name, u.email, u.address, u.role,
                    COALESCE(AVG(r.rating), 0) as average_rating
             FROM users u
             LEFT JOIN stores s ON u.id = s.owner_id
             LEFT JOIN ratings r ON s.id = r.store_id
             WHERE u.id = ?
             GROUP BY u.id, u.name, u.email, u.address, u.role`,
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('Get user details error:', error);
        res.status(500).json({ error: 'Server error fetching user details' });
    }
});

router.post('/stores', adminAuth, storeValidation, validate, async (req, res) => {
    try {
        const { name, email, address, owner_id } = req.body;

        const [existingStore] = await db.query(
            'SELECT id FROM stores WHERE email = ?',
            [email]
        );

        if (existingStore.length > 0) {
            return res.status(400).json({ error: 'Store already exists with this email' });
        }

        const [owner] = await db.query(
            'SELECT id FROM users WHERE id = ? AND role = ?',
            [owner_id, 'store_owner']
        );

        if (owner.length === 0) {
            return res.status(400).json({ error: 'Invalid store owner' });
        }

        const [result] = await db.query(
            'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
            [name, email, address, owner_id]
        );

        res.status(201).json({
            message: 'Store created successfully',
            store: {
                id: result.insertId,
                name,
                email,
                address,
                owner_id
            }
        });
    } catch (error) {
        console.error('Add store error:', error);
        res.status(500).json({ error: 'Server error adding store' });
    }
});

router.get('/stores', adminAuth, async (req, res) => {
    try {
        const { name, email, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;

        let query = `
            SELECT s.id, s.name, s.email, s.address, s.owner_id,
                   u.name as owner_name,
                   COUNT(r.id) as total_ratings,
                   COALESCE(AVG(r.rating), 0) as average_rating
            FROM stores s
            LEFT JOIN users u ON s.owner_id = u.id
            LEFT JOIN ratings r ON s.id = r.store_id
            WHERE 1=1
        `;
        const params = [];

        if (name) {
            query += ' AND s.name LIKE ?';
            params.push(`%${name}%`);
        }

        if (email) {
            query += ' AND s.email LIKE ?';
            params.push(`%${email}%`);
        }

        if (address) {
            query += ' AND s.address LIKE ?';
            params.push(`%${address}%`);
        }

        query += ' GROUP BY s.id, s.name, s.email, s.address, s.owner_id, u.name';

        const allowedSortFields = ['name', 'email', 'address', 'average_rating'];
        const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'name';
        const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        query += ` ORDER BY s.${sortField} ${order}`;

        const [stores] = await db.query(query, params);

        res.json(stores);
    } catch (error) {
        console.error('Get stores error:', error);
        res.status(500).json({ error: 'Server error fetching stores' });
    }
});

module.exports = router;
