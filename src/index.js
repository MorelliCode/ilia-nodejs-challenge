const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('./database');
require('dotenv').config();


const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const SECRET = process.env.JWT_PRIVATE_KEY


console.log('Wallet service starting...');

// Middleware to authenticate tokens
const authenticateToken = (request, response, next) => {
    const authHeader = request.headers['authorization'];

    let token;
    if (authHeader) {
        token = authHeader.split(' ')[1];
    };

    if (!token) {
        return response.status(401).json({ error: 'Access token is missing or invalid' });
    };

    jwt.verify(token, SECRET, (err, user) => {
        if (err) {return response.status(401).json({ error: 'Access token is missing or invalid' })};
        next();
    })
}


// Initialize database
const initDb = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id VARCHAR(255) NOT NULL,
      amount INTEGER NOT NULL,
      type VARCHAR(10) CHECK (type IN ('CREDIT', 'DEBIT')) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
};


// Routes
// POST /transactions
app.post('/transactions', authenticateToken, async (request, response) => {
    const user_id = request.body.user_id;
    const amount = request.body.amount;
    const type = request.body.type;

    if (!user_id || !amount || !type) {
        return response.status(400).json({ error: 'Missing one or more required fields: user_id, amount, type' });
    };

    if (type.toUpperCase() !== 'CREDIT' && type.toUpperCase() !== 'DEBIT') {
        return response.status(400).json({ error: 'Invalid transaction type. Must be either CREDIT or DEBIT' });
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
app.get('/transactions', authenticateToken, async (request, response) => {
    const type = request.query.type;

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


// GET /balance
app.get('/balance', authenticateToken, async (request, response) => {
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

// Start the server
const startServer = async () => {
    try {
        console.log('Connecting to database and initializing...');
        await initDb();
        console.log('Database initialized successfully.');

        app.listen(PORT, () => {
            console.log(`Wallet service is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('FAILED to start service:', error.message);
        process.exit(1);
    }
};

startServer();