const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Simplified CORS: Allow any origin that connects (Reflects Request Origin)
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Enable pre-flight for all routes
app.options('*', cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes - setup must be first
app.use('/api/setup', require('./routes/setup'));
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Barokah Rizky API is running' });
});

// === AUTO SETUP DATABASE ON START ===
const db = require('./config/db');
async function autoSetupDatabase() {
    try {
        console.log("🚀 Starting Auto Database Setup...");

        // 1. Users Table
        await db.query(`CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL, role ENUM('owner', 'customer') NOT NULL)`);

        // 2. Transactions Table
        await db.query(`CREATE TABLE IF NOT EXISTS transactions (id INT AUTO_INCREMENT PRIMARY KEY, date DATETIME DEFAULT CURRENT_TIMESTAMP, customer_name VARCHAR(255), wood_type VARCHAR(50), total_volume DECIMAL(10, 4), total_price DECIMAL(15, 2), details JSON)`);

        // 3. Default Users
        await db.query(`INSERT IGNORE INTO users (username, password, role) VALUES ('owner', 'owner123', 'owner'), ('customer', 'customer123', 'customer')`);

        console.log("✅ AUTO DATABASE SETUP COMPLETED!");
    } catch (err) {
        console.error("❌ Auto Setup Failed:", err);
    }
}

app.listen(PORT, async () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Database: ${process.env.DB_NAME}`);
    await autoSetupDatabase(); // Run setup on start
});
