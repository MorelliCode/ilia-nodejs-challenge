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

// Start the server
const startServer = async () => {
    try {
        console.log('Connecting to database and initializing...');
        await db.initDb();
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