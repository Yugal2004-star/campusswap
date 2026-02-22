const express = require('express');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const optionalAuth = require('../middleware/optionalAuth');
const { uploadLimiter } = require('../middleware/rateLimiter');
const {
  getListings, getListing, createListing, updateListing, deleteListing,
  uploadListingImages, deleteListingImage, getMyListings, reportListing,
  getWishlist, toggleWishlist,
} = require('../controllers/listingController');
const { createListingSchema, updateListingSchema, validate } = require('../validations/listingValidation');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// ─── PUBLIC routes (no login needed) ─────────────────────────
router.get('/', optionalAuth, getListings);           // Browse all listings
router.get('/wishlist', authMiddleware, getWishlist); // Must be before /:id
router.get('/my', authMiddleware, getMyListings);     // Must be before /:id
router.get('/:id', optionalAuth, getListing);         // View single listing

// ─── PROTECTED routes (login required) ───────────────────────
router.post('/', authMiddleware, validate(createListingSchema), createListing);
router.put('/:id', authMiddleware, validate(updateListingSchema), updateListing);
router.delete('/:id', authMiddleware, deleteListing);
router.post('/:id/images', authMiddleware, uploadLimiter, upload.array('images', 5), uploadListingImages);
router.delete('/:id/images/:imageId', authMiddleware, deleteListingImage);
router.post('/:id/report', authMiddleware, reportListing);
router.post('/:id/wishlist', authMiddleware, toggleWishlist);

module.exports = router;