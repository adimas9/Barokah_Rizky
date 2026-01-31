require('dotenv').config({ path: './backend/.env' });
const mysql = require('mysql2/promise');

async function checkDB() {
    console.log('Connecting to database...');
    console.log('Host:', process.env.DB_HOST);
    console.log('User:', process.env.DB_USER);
    console.log('DB:', process.env.DB_NAME);

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('✅ Connected!');

        const [rows] = await connection.query('SELECT * FROM transactions');
        console.log(`\n📊 Total Transactions Found: ${rows.length}`);

        if (rows.length > 0) {
            console.log('Data Preview (First 3):');
            rows.slice(0, 3).forEach((row, i) => {
                console.log(`\nRow ${i + 1}:`);
                console.log(`- ID: ${row.id}`);
                console.log(`- Customer: ${row.customer_name}`);
                console.log(`- Is Owner Input: ${row.is_owner_input} (Type: ${typeof row.is_owner_input})`);
                console.log(`- Created By: ${row.created_by}`);
                console.log(`- Grand Total: ${row.grand_total}`);
            });
        } else {
            console.log('⚠️ Table is EMPTY! Save function is not working.');
        }

        await connection.end();
    } catch (err) {
        console.error('❌ Error:', err);
    }
}

checkDB();
