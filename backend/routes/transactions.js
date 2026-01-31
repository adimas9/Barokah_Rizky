const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all transactions
router.get('/', async (req, res) => {
    const { isOwnerInput, createdBy } = req.query;
    console.log(`[API] GET /transactions params:`, req.query);

    try {
        // Step 1: Fetch transactions
        let query = 'SELECT * FROM transactions WHERE 1=1';
        const params = [];

        if (isOwnerInput !== undefined) {
            query += ' AND is_owner_input = ?';
            const isOwnerVal = (String(isOwnerInput) === 'true' || isOwnerInput === '1') ? 1 : 0;
            params.push(isOwnerVal);
        }

        if (createdBy) {
            query += ' AND created_by = ?';
            params.push(createdBy);
        }

        query += ' ORDER BY created_at DESC';

        const [transactions] = await db.query(query, params);
        console.log(`[API] Found ${transactions.length} transactions`);

        // Step 2: Fetch all items for these transactions (if any)
        if (transactions.length > 0) {
            const transactionIds = transactions.map(t => t.id);
            const placeholders = transactionIds.map(() => '?').join(',');
            const itemsQuery = `SELECT * FROM transaction_items WHERE transaction_id IN (${placeholders})`;
            const [items] = await db.query(itemsQuery, transactionIds);

            // Step 3: Map items to their transactions
            const itemsByTransaction = {};
            items.forEach(item => {
                if (!itemsByTransaction[item.transaction_id]) {
                    itemsByTransaction[item.transaction_id] = [];
                }
                itemsByTransaction[item.transaction_id].push({
                    id: item.id,
                    type: item.type,
                    length: item.length,
                    diameter: item.diameter,
                    diameterClass: item.diameter_class,
                    isi: item.isi
                });
            });

            // Step 4: Build final response
            const result = transactions.map(row => ({
                id: row.id,
                customerName: row.customer_name,
                isOwnerInput: row.is_owner_input === 1,
                grandTotal: Number(row.grand_total) || 0,
                totalVolume: Number(row.total_volume) || 0,
                createdBy: row.created_by,
                date: row.created_at,
                items: itemsByTransaction[row.id] || []
            }));

            console.log(`[API] Returning ${result.length} transactions with items`);
            return res.json(result);
        }

        // No transactions found
        console.log('[API] No transactions found');
        res.json([]);
    } catch (error) {
        console.error('[API] Error fetching transactions:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// Save new transaction
router.post('/', async (req, res) => {
    const { customerName, items, grandTotal, totalVolume, isOwnerInput, createdBy } = req.body;

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Insert transaction
        const [result] = await connection.query(
            `INSERT INTO transactions (customer_name, is_owner_input, grand_total, total_volume, created_by)
       VALUES (?, ?, ?, ?, ?)`,
            [customerName, isOwnerInput ? 1 : 0, grandTotal, totalVolume, createdBy]
        );

        const transactionId = result.insertId;

        // Insert items
        for (const item of items) {
            await connection.query(
                `INSERT INTO transaction_items (transaction_id, type, length, diameter, diameter_class, isi)
         VALUES (?, ?, ?, ?, ?, ?)`,
                [transactionId, item.type, item.length, item.diameter, item.diameterClass, item.isi]
            );
        }

        await connection.commit();

        res.json({ success: true, id: transactionId });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ error: 'Failed to save transaction' });
    } finally {
        connection.release();
    }
});

module.exports = router;
