const express = require('express');
const { Client } = require('pg');
const app = express();

const PORT = process.env.PORT || 3000;
const DB_HOST = process.env.DB_HOST || 'postgres';
const DB_PORT = process.env.DB_PORT || 5432;
const DB_NAME = process.env.DB_NAME || 'pingpong';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';

// PostgreSQL client connection string
const connectionString = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

// Initialize database connection
let dbClient;

async function initializeDatabase() {
  dbClient = new Client({ connectionString });
  
  let retries = 30;
  while (retries > 0) {
    try {
      await dbClient.connect();
      console.log('Connected to PostgreSQL database');
      break;
    } catch (error) {
      retries--;
      if (retries === 0) {
        console.error('Failed to connect to database after 30 attempts:', error.message);
        process.exit(1);
      }
      console.log(`Failed to connect, retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// Health check endpoint - main endpoint that increments counter
app.get('/', async (req, res) => {
  try {
    // Update counter in database
    const result = await dbClient.query(
      'UPDATE pingpong SET counter = counter + 1 WHERE id = 1 RETURNING counter'
    );
    const counter = result.rows[0].counter;
    res.send(`pong ${counter}`);
    console.log(`Counter incremented to: ${counter}`);
  } catch (error) {
    console.error('Error updating counter:', error.message);
    res.status(500).send('Error updating counter');
  }
});

// Start server after database is ready
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
});
