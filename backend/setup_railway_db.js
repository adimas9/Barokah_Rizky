const mysql = require('mysql2/promise');
require('dotenv').config();

// KITA AKAN PAKAI URL DATABASE RAILWAY LANGSUNG
// Ganti string di bawah ini dengan MYSQL_URL dari Railway Variables
// Contoh format: mysql://root:password@host:port/database
const RAILWAY_DATABASE_URL = process.env.RAILWAY_DATABASE_URL;

async function setupDatabase() {
    if (!RAILWAY_DATABASE_URL) {
        console.error("❌ ERROR: RAILWAY_DATABASE_URL belum diisi di file .env!");
        console.log("   --> Copy MYSQL_URL dari Railway > MySQL > Variables");
        console.log("   --> Masukkan ke file .env: RAILWAY_DATABASE_URL=....");
        process.exit(1);
    }

    console.log("🚀 Connecting to Railway Database...");
    const connection = await mysql.createConnection(RAILWAY_DATABASE_URL);

    try {
        console.log("✅ Connected! Creating tables...");

        // 1. Create Users Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('owner', 'customer') NOT NULL
            )
        `);
        console.log("   - Table 'users' created/checked.");

        // 2. Create Transactions Table
        await connection.query(`
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
        console.log("   - Table 'transactions' created/checked.");

        // 3. Insert Default Users
        // Insert Owner
        await connection.query(`
            INSERT IGNORE INTO users (username, password, role) 
            VALUES ('owner', 'owner123', 'owner')
        `);
        // Insert Customer
        await connection.query(`
            INSERT IGNORE INTO users (username, password, role) 
            VALUES ('customer', 'customer123', 'customer')
        `);
        console.log("✅ Default users inserted (owner/owner123, customer/customer123).");

        console.log("\n🎉 DATABASE SETUP COMPLETE!");
        console.log("   Sekarang coba login di aplikasi Vercel lo.");

    } catch (err) {
        console.error("❌ Error setting up database:", err);
    } finally {
        await connection.end();
    }
}

setupDatabase();
