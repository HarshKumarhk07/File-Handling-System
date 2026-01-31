const { check, validationResult } = require('express-validator');

// Invalid TLD typos to reject (e.g. .comm instead of .com)
const INVALID_TLDS = ['comm', 'cpm', 'con', 'cim', 'vom', 'coom', 'colm', 'comn', 'xom', 'orgg', 'nnet', 'nett'];

const rejectInvalidTld = (value) => {
    const tld = value.split('.').pop()?.toLowerCase() || '';
    if (INVALID_TLDS.includes(tld)) {
        throw new Error('Please enter a valid email address (invalid domain)');
    }
    return true;
};

// Validation rules
const validateRegister = [
    check('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .escape(),
    check('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please include a valid email')
        .custom(rejectInvalidTld)
        .toLowerCase(),
    check('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const validateLogin = [
    check('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please include a valid email')
        .custom(rejectInvalidTld)
        .toLowerCase(),
    check('password')
        .notEmpty().withMessage('Password is required')
];

// Middleware to check for errors
const runValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: errors.array()[0].msg, // Return the first error message
            errors: errors.array()
        });
    }
    next();
};

module.exports = {
    validateRegister,
    validateLogin,
    runValidation
};
