const express = require('express');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const { getMe, updateMe, getUserProfile, uploadAvatar } = require('../controllers/userController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// ─── PUBLIC ──────────────────────────────────────────────────
router.get('/:id', getUserProfile);         // Anyone can view a seller profile

// ─── PROTECTED ───────────────────────────────────────────────
router.get('/me', authMiddleware, getMe);   // NOTE: /me must come before /:id in app.js
router.patch('/me', authMiddleware, updateMe);
router.post('/avatar', authMiddleware, upload.single('avatar'), uploadAvatar);

module.exports = router;