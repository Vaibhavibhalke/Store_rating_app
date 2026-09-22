const { body, validationResult } = require('express-validator');

// Validation rules
const signupValidation = [
    body('name')
        .trim()
        .isLength({ min: 20, max: 60 })
        .withMessage('Name must be between 20 and 60 characters'),
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('password')
        .isLength({ min: 8, max: 16 })
        .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[a-zA-Z0-9]).{8,16}$/)
        .withMessage('Password must be 8-16 characters with at least one uppercase letter and one special character'),
    body('address')
        .optional()
        .trim()
        .isLength({ max: 400 })
        .withMessage('Address must not exceed 400 characters')
];

const loginValidation = [
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

const updatePasswordValidation = [
    body('newPassword')
        .isLength({ min: 8, max: 16 })
        .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[a-zA-Z0-9]).{8,16}$/)
        .withMessage('Password must be 8-16 characters with at least one uppercase letter and one special character')
];

const ratingValidation = [
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5')
];

const storeValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Store name is required'),
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('address')
        .trim()
        .notEmpty()
        .isLength({ max: 400 })
        .withMessage('Address is required and must not exceed 400 characters'),
    body('owner_id')
        .isInt()
        .withMessage('Owner ID must be a valid integer')
];

const addUserValidation = [
    body('name')
        .trim()
        .isLength({ min: 20, max: 60 })
        .withMessage('Name must be between 20 and 60 characters'),
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('password')
        .isLength({ min: 8, max: 16 })
        .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[a-zA-Z0-9]).{8,16}$/)
        .withMessage('Password must be 8-16 characters with at least one uppercase letter and one special character'),
    body('address')
        .trim()
        .isLength({ max: 400 })
        .withMessage('Address must not exceed 400 characters'),
    body('role')
        .isIn(['admin', 'normal_user', 'store_owner'])
        .withMessage('Role must be admin, normal_user, or store_owner')
];

// Validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = {
    signupValidation,
    loginValidation,
    updatePasswordValidation,
    ratingValidation,
    storeValidation,
    addUserValidation,
    validate
};
