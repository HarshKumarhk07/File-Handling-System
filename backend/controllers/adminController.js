const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const File = require('../models/fileModel');
const { deleteFromCloudinary } = require('../services/cloudinaryService');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
});

// @desc    Get all files (Global)
// @route   GET /api/admin/files
// @access  Private/Admin
const getAllFiles = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const files = await File.find({ isDeleted: false })
        .populate('owner', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await File.countDocuments({ isDeleted: false });

    res.json({
        files,
        page,
        pages: Math.ceil(total / limit),
        total
    });
});

// @desc    Update user role (Promote/Demote)
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
        res.status(400);
        throw new Error('Invalid role. Use "user" or "admin"');
    }

    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.role = role;
    await user.save();

    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
});

// @desc    Get system stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = asyncHandler(async (req, res) => {
    const [totalUsers, totalFiles] = await Promise.all([
        User.countDocuments({}),
        File.countDocuments({ isDeleted: false })
    ]);
    res.json({ totalUsers, totalFiles });
});

// @desc    Delete any file (Moderation)
// @route   DELETE /api/admin/files/:id
// @access  Private/Admin
const deleteAnyFile = asyncHandler(async (req, res) => {
    const file = await File.findById(req.params.id);

    if (!file) {
        res.status(404);
        throw new Error('File not found');
    }

    try {
        // Delete from Cloudinary
        await deleteFromCloudinary(file.publicId);

        // Delete from DB
        await file.deleteOne();

        res.json({ message: 'File removed by admin' });
    } catch (error) {
        res.status(500);
        throw new Error('Admin delete failed: ' + error.message);
    }
});

module.exports = {
    getAllUsers,
    getAllFiles,
    updateUserRole,
    getStats,
    deleteAnyFile
};
