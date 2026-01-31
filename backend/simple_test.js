require('dotenv').config();
const mysql = require('mysql2/promise');

async function simpleTest() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('✅ DB Connected!\n');

        // Simple test - no subquery
        const [rows] = await connection.query('SELECT * FROM transactions LIMIT 1');
        console.log('Sample transaction:');
        console.log(rows[0]);

        await connection.end();
        console.log('\n✅ Test complete!');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

simpleTest();
