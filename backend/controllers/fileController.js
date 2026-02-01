const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const File = require('../models/fileModel');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');

// Helper to add history and enforce limit
const addToHistory = async (file, action, userId, details = '') => {
    file.history.push({
        action,
        performedBy: userId,
        details
    });

    // Enforce 50 item limit
    if (file.history.length > 50) {
        file.history.shift(); // Remove oldest
    }
};

// @desc    Upload a file
// @route   POST /api/files/upload
// @access  Private
const uploadFile = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded');
    }

    try {
        // Upload to Cloudinary using Service
        const result = await uploadToCloudinary(req.file.buffer, req.user._id, req.file.originalname, req.file.mimetype);

        // Save to DB
        const file = await File.create({
            originalName: req.file.originalname,
            url: result.secure_url,
            publicId: result.public_id,
            size: result.bytes,
            mimetype: result.format ? `image/${result.format}` : req.file.mimetype, // Cloudinary might change format
            owner: req.user._id,
            history: [{ // Initial History
                action: 'UPLOAD',
                performedBy: req.user._id,
                timestamp: Date.now()
            }]
        });

        res.status(201).json(file);
    } catch (error) {
        res.status(500);
        throw new Error('File upload failed: ' + error.message);
    }
});

// @desc    Get user files (Paginated)
// @route   GET /api/files
// @access  Private
const getFiles = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const showAll = req.query.all === 'true' && req.user.role === 'admin';

    const query = showAll
        ? { isDeleted: false }
        : {
            $or: [
                { owner: req.user._id },
                { 'sharedWith.user': req.user._id }
            ],
            isDeleted: false
        };

    const files = await File.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('owner', 'name email') // Populate owner details
        .populate('sharedWith.user', 'name email')
        .populate('history.performedBy', 'name email'); // Populate history users

    const total = await File.countDocuments(query);

    res.json({
        files,
        page,
        pages: Math.ceil(total / limit),
        total
    });
});

// @desc    Share file with user
// @route   POST /api/files/:id/share
// @access  Private
const shareFile = asyncHandler(async (req, res) => {

    const { email, permission } = req.body;
    const file = await File.findById(req.params.id);

    if (!file) {
        res.status(404);
        throw new Error('File not found');
    }

    // Only owner can share
    if (file.owner.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to share this file');
    }

    // Lookup user case-insensitively
    const userToShare = await User.findOne({ email: { $regex: `^${email.trim()}$`, $options: 'i' } });

    if (!userToShare) {
        res.status(404);
        throw new Error('User not found');
    }

    if (userToShare._id.toString() === req.user.id) {
        res.status(400);
        throw new Error('Cannot share with yourself');
    }

    // Check if already shared
    const existingShareIndex = file.sharedWith.findIndex(
        s => s.user.toString() === userToShare._id.toString()
    );

    if (existingShareIndex > -1) {
        // Update permission
        file.sharedWith[existingShareIndex].permission = permission || 'view';
        await addToHistory(file, 'SHARE', req.user._id, `Updated permission for ${userToShare.email}`);
    } else {
        // Add new share
        file.sharedWith.push({
            user: userToShare._id,
            permission: permission || 'view'
        });
        await addToHistory(file, 'SHARE', req.user._id, `Shared with ${userToShare.email}`);
    }

    await file.save();
    res.json(file);
});

// @desc    Revoke share - remove user from shared access
// @route   DELETE /api/files/:id/share/:userId
// @access  Private (Owner only)
const revokeShare = asyncHandler(async (req, res) => {
    const { id, userId } = req.params;
    const file = await File.findById(id).populate('sharedWith.user', 'name email');

    if (!file) {
        res.status(404);
        throw new Error('File not found');
    }

    if (file.owner.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to revoke access');
    }

    const targetId = userId;
    // Find who we are removing for history log
    const userRemoved = file.sharedWith.find(s => {
        const shareUserId = s.user?._id?.toString?.() ?? s.user?.toString?.();
        return shareUserId === targetId;
    });

    file.sharedWith = file.sharedWith.filter(s => {
        const shareUserId = s.user?._id?.toString?.() ?? s.user?.toString?.();
        return shareUserId !== targetId;
    });

    await addToHistory(file, 'REVOKE', req.user._id, `Revoked access for ${userRemoved?.user?.email || 'user'}`);
    await file.save();

    res.json(file);
});

// @desc    Delete file (Soft Delete)
// @route   DELETE /api/files/:id
// @access  Private
const deleteFile = asyncHandler(async (req, res) => {
    const file = await File.findById(req.params.id);

    if (!file) {
        res.status(404);
        throw new Error('File not found');
    }

    // Admin can delete any file
    const isAdmin = req.user.role === 'admin';
    const isOwner = file.owner.toString() === req.user.id;
    const sharedUser = file.sharedWith.find(
        s => s.user.toString() === req.user.id && s.permission === 'edit'
    );

    if (!isAdmin && !isOwner && !sharedUser) {
        res.status(401);
        throw new Error('Not authorized');
    }

    // Soft Delete
    file.isDeleted = true;
    file.deletedAt = Date.now();

    const details = isAdmin && !isOwner ? `Deleted by Admin ${req.user.name}` : 'File deleted';
    await addToHistory(file, 'DELETE', req.user._id, details);

    await file.save();

    res.json({ message: 'File moved to recycle bin' });
});

// @desc    Download file (proxies from Cloudinary with Content-Disposition: attachment)
// @route   GET /api/files/:id/download
// @access  Private
const downloadFile = asyncHandler(async (req, res) => {
    const file = await File.findById(req.params.id);
    if (!file) {
        res.status(404);
        throw new Error('File not found');
    }
    const isAdmin = req.user.role === 'admin';
    const isOwner = file.owner.toString() === req.user.id;
    const hasAccess = isAdmin || isOwner || file.sharedWith.some(s => s.user.toString() === req.user.id);
    if (!hasAccess) {
        res.status(401);
        throw new Error('Not authorized');
    }
    const response = await fetch(file.url);
    if (!response.ok) throw new Error('Failed to fetch file');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`);
    res.setHeader('Content-Type', file.mimetype || 'application/octet-stream');
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
});

// @desc    Permanently delete file (optional)
// @route   DELETE /api/files/:id/permanent
// @access  Private
const hardDeleteFile = asyncHandler(async (req, res) => {
    const file = await File.findById(req.params.id);

    if (!file) {
        res.status(404);
        throw new Error('File not found');
    }

    if (file.owner.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized');
    }

    // Delete from Cloudinary
    await deleteFromCloudinary(file.publicId);

    // Delete from DB
    await file.deleteOne();

    res.json({ message: 'File permanently deleted' });
});


module.exports = {
    uploadFile,
    getFiles,
    shareFile,
    revokeShare,
    deleteFile,
    hardDeleteFile,
    downloadFile
};
