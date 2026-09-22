const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'No authentication token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid authentication token' });
    }
};

const adminAuth = (req, res, next) => {
    auth(req, res, () => {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admin only.' });
        }
        next();
    });
};

const storeOwnerAuth = (req, res, next) => {
    auth(req, res, () => {
        if (req.user.role !== 'store_owner') {
            return res.status(403).json({ error: 'Access denied. Store owner only.' });
        }
        next();
    });
};

module.exports = { auth, adminAuth, storeOwnerAuth };
