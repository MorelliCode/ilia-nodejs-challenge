
// Initialize PostgreSQL connection pool
const { Pool } = require("pg");

const pool  = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Initialize database
const initDb = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id VARCHAR(255) NOT NULL,
      amount INTEGER NOT NULL,
      type VARCHAR(10) CHECK (type IN ('CREDIT', 'DEBIT')) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
};


module.exports = {
    query: (text, params) => pool.query(text, params),
    initDb: initDb,
};