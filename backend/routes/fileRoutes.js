const express = require('express');
const router = express.Router();
const { uploadFile, getFiles, deleteFile, hardDeleteFile, shareFile, revokeShare, downloadFile } = require('../controllers/fileController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/upload', protect, upload.single('file'), uploadFile);
router.get('/', protect, getFiles);
router.get('/:id/download', protect, downloadFile);
router.post('/:id/share', protect, shareFile);
router.delete('/:id/share/:userId', protect, revokeShare);
router.delete('/:id', protect, deleteFile);
router.delete('/:id/permanent', protect, hardDeleteFile);

module.exports = router;
