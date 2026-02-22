const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { generalLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/authMiddleware');

const listingRoutes = require('./routes/listingRoutes');
const chatRoutes = require('./routes/chatRoutes');
const meetupRoutes = require('./routes/meetupRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// Rate limiting
app.use('/api/', generalLimiter);

// ─── IMPORTANT: /me must be registered BEFORE userRoutes /:id ──
// Register /api/users/me explicitly here to avoid /:id catching "me" as a user ID
app.get('/api/users/me', authMiddleware, require('./controllers/userController').getMe);
app.patch('/api/users/me', authMiddleware, require('./controllers/userController').updateMe);
app.post('/api/users/avatar', authMiddleware,
  require('multer')({ storage: require('multer').memoryStorage() }).single('avatar'),
  require('./controllers/userController').uploadAvatar
);

// Routes
app.use('/api/listings', listingRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/meetups', meetupRoutes);
app.use('/api/users', userRoutes);   // /:id public profile
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// 404
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Error handler
app.use(errorHandler);

module.exports = app;