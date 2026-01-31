const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const { notFound } = require('./middleware/notFoundMiddleware');

dotenv.config();

const app = express();

// Middleware
app.use(helmet()); // Security Headers
app.use(cors({
    origin: [
        process.env.CLIENT_URL,
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'https://file-handling-system.vercel.app',
        'https://file-handling-system-git-main-harshkumarhk07s-projects.vercel.app'
    ],
    credentials: true
}));
app.use(express.json()); // Body Parser
app.use(express.urlencoded({ extended: false }));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev')); // Logging
}

// Rate Limiting - Stricter in production, relaxed in development
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 500, // 500 in dev to avoid 429 during testing
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false
});
app.use(limiter);

// Routes
app.get('/', (req, res) => {
    res.send('API is running...');
});

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is healthy' });
});

// Debug endpoint - verify DB connection & user count (dev only)
app.get('/api/debug/db', async (req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(404).json({ message: 'Not found' });
    }
    try {
        const mongoose = require('mongoose');
        const User = require('./models/userModel');
        const dbName = mongoose.connection.db?.databaseName || mongoose.connection.name;
        const userCount = await User.countDocuments();
        res.json({ database: dbName, usersCount: userCount, connected: mongoose.connection.readyState === 1 });
    } catch (err) {
        next(err);
    }
});

// Debug endpoint - create test user to verify DB writes (dev only)
app.post('/api/debug/create-test-user', async (req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(404).json({ message: 'Not found' });
    }
    try {
        const User = require('./models/userModel');
        const testEmail = `test-${Date.now()}@debug.local`;
        const user = await User.create({ name: 'Debug User', email: testEmail, password: 'test123456', role: 'user' });
        const count = await User.countDocuments();
        console.log(`[Debug] Created test user: ${testEmail}, total users: ${count}`);
        res.json({ success: true, email: testEmail, userId: user._id, totalUsers: count });
    } catch (err) {
        console.error('[Debug] Create test user failed:', err.message);
        next(err);
    }
});

// Import Routes (Placeholders for now)
// Import Routes (Placeholders for now)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/files', require('./routes/fileRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Error Handling (Must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
};

startServer();
