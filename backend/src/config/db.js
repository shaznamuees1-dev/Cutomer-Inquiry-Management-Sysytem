
const { Pool } = require("pg");

// Reuse a pool of PostgreSQL connections.
// This avoids creating a new connection for every API request.
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Export the pool so other backend files can execute SQL queries.
module.exports = pool;
