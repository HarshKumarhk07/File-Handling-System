const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const { generateToken } = require('../services/authService');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    // Check if user exists (case-insensitive)
    const emailLower = email.toLowerCase();
    const userExists = await User.findOne({ email: new RegExp(`^${emailLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Super Admin: ADMIN_EMAIL gets admin role
    const role = process.env.ADMIN_EMAIL && emailLower === process.env.ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user';

    const user = await User.create({
        name,
        email: emailLower,
        password,
        role
    });

    if (user) {
        // Verify the user was actually saved to DB
        const verified = await User.findById(user._id);
        console.log(`[Auth] User registered: ${user.email} (id: ${user._id}) | DB verified: ${!!verified}`);
        if (!verified) {
            console.error('[Auth] CRITICAL: User created but not found in DB!');
        }
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id.toString())
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check for user email (case-insensitive)
    const emailLower = email.toLowerCase();
    const user = await User.findOne({ email: new RegExp(`^${emailLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });

    // 1. Check if user exists
    if (!user) {
        res.status(401);
        throw new Error('Invalid credentials');
    }

    // 2. Check if password matches
    if (await user.matchPassword(password)) {
        // Legacy: Ensure ADMIN_EMAIL user has admin role (in case they registered before ADMIN_EMAIL was set)
        if (process.env.ADMIN_EMAIL && emailLower === process.env.ADMIN_EMAIL.toLowerCase() && user.role !== 'admin') {
            user.role = 'admin';
            await user.save();
        }
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id.toString())
        });
    } else {
        res.status(401);
        throw new Error('Invalid credentials');
    }
});

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    res.status(200).json(req.user);
});

module.exports = {
    registerUser,
    loginUser,
    getMe
};
