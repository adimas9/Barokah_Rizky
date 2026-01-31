require('dotenv').config();
const mysql = require('mysql2/promise');

async function testQuery() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Testing SQL query directly...\n');

        const query = `
            SELECT t.*, 
                (SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', ti.id,
                        'type', ti.type,
                        'length', ti.length,
                        'diameter', ti.diameter,
                        'diameterClass', ti.diameter_class,
                        'isi', ti.isi
                    )
                ) FROM transaction_items ti WHERE ti.transaction_id = t.id) as items
            FROM transactions t
            WHERE is_owner_input = 1
            ORDER BY created_at DESC
            LIMIT 1
        `;

        const [rows] = await connection.query(query);
        console.log('Query result:');
        console.log(JSON.stringify(rows[0], null, 2));

        await connection.end();
    } catch (error) {
        console.error('❌ Query Error:', error.message);
        console.error('Full error:', error);
    }
}

testQuery();
