const express = require('express');
const db = require('./database');
const { balanceRouter } = require('./routes/balance');
const { transactionsRouter } = require('./routes/transactions');

const app = express();
app.use(express.json());

app.use('/balance', balanceRouter);
app.use('/transactions', transactionsRouter);

const PORT = process.env.PORT || 3001;

console.log('Wallet service starting...');



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