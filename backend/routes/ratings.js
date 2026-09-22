const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { auth, storeOwnerAuth } = require('../middleware/auth');
const { ratingValidation, validate } = require('../middleware/validation');

router.post('/', auth, ratingValidation, validate, async (req, res) => {
    try {
        const { store_id, rating } = req.body;
        const userId = req.user.id;

        const [stores] = await db.query('SELECT id FROM stores WHERE id = ?', [store_id]);
        if (stores.length === 0) {
            return res.status(404).json({ error: 'Store not found' });
        }

        const [existingRating] = await db.query(
            'SELECT id FROM ratings WHERE user_id = ? AND store_id = ?',
            [userId, store_id]
        );

        if (existingRating.length > 0) {
            await db.query(
                'UPDATE ratings SET rating = ? WHERE user_id = ? AND store_id = ?',
                [rating, userId, store_id]
            );
            res.json({ message: 'Rating updated successfully' });
        } else {
            await db.query(
                'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
                [userId, store_id, rating]
            );
            res.status(201).json({ message: 'Rating submitted successfully' });
        }
    } catch (error) {
        console.error('Submit rating error:', error);
        res.status(500).json({ error: 'Server error submitting rating' });
    }
});

router.get('/owner/dashboard', storeOwnerAuth, async (req, res) => {
    try {
        const ownerId = req.user.id;

        const [stores] = await db.query(
            'SELECT id, name, email, address FROM stores WHERE owner_id = ?',
            [ownerId]
        );

        if (stores.length === 0) {
            return res.status(404).json({ error: 'No store found for this owner' });
        }

        const store = stores[0];

        const [ratings] = await db.query(
            `SELECT r.id, r.rating, r.created_at,
                    u.name as user_name, u.email as user_email
             FROM ratings r
             JOIN users u ON r.user_id = u.id
             WHERE r.store_id = ?
             ORDER BY r.created_at DESC`,
            [store.id]
        );

        const [avgRating] = await db.query(
            'SELECT COALESCE(AVG(rating), 0) as average_rating FROM ratings WHERE store_id = ?',
            [store.id]
        );

        res.json({
            store: {
                id: store.id,
                name: store.name,
                email: store.email,
                address: store.address
            },
            average_rating: avgRating[0].average_rating,
            total_ratings: ratings.length,
            ratings: ratings
        });
    } catch (error) {
        console.error('Get store dashboard error:', error);
        res.status(500).json({ error: 'Server error fetching store dashboard' });
    }
});

router.get('/my-ratings', auth, async (req, res) => {
    try {
        const userId = req.user.id;

        const [ratings] = await db.query(
            `SELECT r.id, r.rating, r.created_at,
                    s.id as store_id, s.name as store_name, s.address as store_address
             FROM ratings r
             JOIN stores s ON r.store_id = s.id
             WHERE r.user_id = ?
             ORDER BY r.created_at DESC`,
            [userId]
        );

        res.json(ratings);
    } catch (error) {
        console.error('Get user ratings error:', error);
        res.status(500).json({ error: 'Server error fetching user ratings' });
    }
});

module.exports = router;
