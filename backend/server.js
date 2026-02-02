const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// 1. CORS CONFIGURATION (STANDARD & ROBUST)
// ==========================================
// 'origin: true' tells the library to reflect the request origin.
// This allows ANY domain to connect while supporting credentials.
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Explicitly handle Preflight requests for all routes (Express 5 compatible)
app.options(/(.*)/, cors());

// ==========================================
// 2. MIDDLEWARE
// ==========================================
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Log basic request info for debugging
app.use((req, res, next) => {
    console.log(`➡️  ${req.method} ${req.url} | Origin: ${req.headers.origin}`);
    next();
});

// ==========================================
// 3. ROUTES
// ==========================================
// Register setup route first
app.use('/api/setup', require('./routes/setup'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Barokah Rizky API is running' });
});

// ==========================================
// 4. DATABASE AUTO-SETUP & START
// ==========================================
const db = require('./config/db');

async function autoSetupDatabase() {
    try {
        console.log("🚀 Starting Auto Database Setup...");

        await db.query(`CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL, role ENUM('owner', 'customer') NOT NULL)`);
        await db.query(`CREATE TABLE IF NOT EXISTS transactions (id INT AUTO_INCREMENT PRIMARY KEY, date DATETIME DEFAULT CURRENT_TIMESTAMP, customer_name VARCHAR(255), wood_type VARCHAR(50), total_volume DECIMAL(10, 4), total_price DECIMAL(15, 2), details JSON)`);
        await db.query(`INSERT IGNORE INTO users (username, password, role) VALUES ('owner', 'owner123', 'owner'), ('customer', 'customer123', 'customer')`);

        console.log("✅ AUTO DATABASE SETUP COMPLETED!");
    } catch (err) {
        console.error("❌ Auto Setup Failed:", err);
    }
}

app.listen(PORT, async () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Database: ${process.env.DB_NAME}`);
    await autoSetupDatabase();
});
