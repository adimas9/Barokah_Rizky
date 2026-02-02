const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Pakai koneksi db yang sudah ada

// Endpoint rahasia buat setup database
router.get('/setup-db-secret-123', async (req, res) => {
    try {
        // 1. Create Users Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('owner', 'customer') NOT NULL
            )
        `);

        // 2. Create Transactions Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                date DATETIME DEFAULT CURRENT_TIMESTAMP,
                customer_name VARCHAR(255),
                wood_type VARCHAR(50),
                total_volume DECIMAL(10, 4),
                total_price DECIMAL(15, 2),
                details JSON
            )
        `);

        // 3. Insert Default Users
        // Insert Owner
        await db.query(`
            INSERT IGNORE INTO users (username, password, role) 
            VALUES ('owner', 'owner123', 'owner')
        `);
        // Insert Customer
        await db.query(`
            INSERT IGNORE INTO users (username, password, role) 
            VALUES ('customer', 'customer123', 'customer')
        `);

        res.json({
            status: "SUCCESS",
            message: "🎉 Database Tables Created & Default Users Inserted!"
        });

    } catch (error) {
        console.error("Setup DB Error:", error);
        res.status(500).json({
            status: "ERROR",
            message: error.message
        });
    }
});

module.exports = router;
