const pg = require('pg');

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function ConnectDatabase() {
  try {
    const client = await pool.connect();
    console.log('Connected to the database successfully');
    return { client, pool };
  } catch(err) {
    console.error('Error connecting to the database', err.stack);
  }
}

module.exports = ConnectDatabase();