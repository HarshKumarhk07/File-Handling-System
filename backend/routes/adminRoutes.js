const express = require('express');
const router = express.Router();
const { getAllUsers, getAllFiles, updateUserRole, getStats, deleteAnyFile } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);
router.use(admin);

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.get('/files', getAllFiles);
router.delete('/files/:id', deleteAnyFile);

module.exports = router;
