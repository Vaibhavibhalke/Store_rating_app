const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
    try {
        const { search, sortBy = 'name', sortOrder = 'ASC' } = req.query;
        const userId = req.user.id;

        let query = `
            SELECT s.id, s.name, s.email, s.address,
                   COUNT(r.id) as total_ratings,
                   COALESCE(AVG(r.rating), 0) as average_rating,
                   (SELECT rating FROM ratings WHERE user_id = ? AND store_id = s.id) as user_rating
            FROM stores s
            LEFT JOIN ratings r ON s.id = r.store_id
            WHERE 1=1
        `;
        const params = [userId];

        if (search) {
            query += ' AND (s.name LIKE ? OR s.address LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' GROUP BY s.id, s.name, s.email, s.address';

        const allowedSortFields = ['name', 'address', 'average_rating'];
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

router.get('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const [stores] = await db.query(
            `SELECT s.id, s.name, s.email, s.address,
                    COUNT(r.id) as total_ratings,
                    COALESCE(AVG(r.rating), 0) as average_rating,
                    (SELECT rating FROM ratings WHERE user_id = ? AND store_id = s.id) as user_rating
             FROM stores s
             LEFT JOIN ratings r ON s.id = r.store_id
             WHERE s.id = ?
             GROUP BY s.id, s.name, s.email, s.address`,
            [userId, id]
        );

        if (stores.length === 0) {
            return res.status(404).json({ error: 'Store not found' });
        }

        res.json(stores[0]);
    } catch (error) {
        console.error('Get store error:', error);
        res.status(500).json({ error: 'Server error fetching store' });
    }
});

module.exports = router;
