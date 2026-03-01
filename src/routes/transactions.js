const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middlewares/auth');



// Routes
// POST /transactions
router.post('/', authenticateToken, async (request, response) => {
    const user_id = request.body.user_id;
    const amount = request.body.amount;
    const type = request.body.type;

    if (!user_id || !amount || !type) {
        return response.status(400).json({ error: 'Missing one or more required fields: user_id, amount, type' });
    };

    if (typeof type !== 'string') {
        return response.status(400).json({ error: 'Transaction type must be a string' });
    };

    if (type.toUpperCase() !== 'CREDIT' && type.toUpperCase() !== 'DEBIT') {
        return response.status(400).json({ error: 'Invalid transaction type. Must be either CREDIT or DEBIT' });
    };

    if (typeof user_id !== 'string') {
        return response.status(400).json({ error: 'User ID must be a string' });
    };

    if(typeof amount !== 'number' || amount <= 0) {
        return response.status(400).json({ error: 'Amount must be a positive integer' });
    };

    try {
        const result = await db.query(
            'INSERT INTO transactions (user_id, amount, type) VALUES ($1, $2, $3) RETURNING *',
            [user_id, amount, type.toUpperCase()]
        );
        response.status(200).json(result.rows[0]);
    } catch (error) {
        response.status(500).json({ error: 'Database Error' });
    };
});

// GET /transactions
router.get('/', authenticateToken, async (request, response) => {
    const type = request.query.type;

    if (type && typeof type !== 'string') {
        return response.status(400).json({ error: 'Transaction type filter must be a string' });
    };

    if (type &&type.toUpperCase() !== 'CREDIT' && type.toUpperCase() !== 'DEBIT') {
        return response.status(400).json({ error: 'Invalid transaction type filter. Must be either CREDIT or DEBIT' });
    };

    try {
        let result;
        if (type) {
            result = await db.query('SELECT * FROM transactions WHERE type = $1', [type.toUpperCase()]);
        } else {
            result = await db.query('SELECT * FROM transactions');
        }
        response.status(200).json(result.rows);
    } catch (error) {
        response.status(500).json({ error: 'Database Error' });
    };
});

module.exports = { transactionsRouter: router };