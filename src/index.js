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
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      amount INTEGER NOT NULL,
      type VARCHAR(10) CHECK (type IN ('CREDIT', 'DEBIT')) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

initDb();

// Routes
