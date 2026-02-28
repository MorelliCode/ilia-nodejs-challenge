const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middlewares/auth');


// Routes
// GET /balance
router.get('/', authenticateToken, async (request, response) => {
    try {
        const query = `
            SELECT
                SUM(CASE WHEN type = 'CREDIT' THEN amount ELSE 0 END) -
                SUM(CASE WHEN type = 'DEBIT' THEN amount ELSE 0 END) AS amount
            FROM transactions
        `;
        const result = await db.query(query);

        let { amount } = result.rows[0];
        if (amount === null) {
            amount = 0;
        }

        response.status(200).json({ amount: parseInt(amount) });
    } catch (error) {
        response.status(500).json({ error: 'Calculation Error' });
    };
});

module.exports = { balanceRouter: router };