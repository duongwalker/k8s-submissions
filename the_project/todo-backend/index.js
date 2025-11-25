const express = require('express');
const { Client } = require('pg');
const app = express();
const PORT = process.env.PORT || 3000;

// Database configuration from environment variables
const DB_HOST = process.env.DB_HOST || 'todo-postgres';
const DB_PORT = process.env.DB_PORT || 5432;
const DB_NAME = process.env.DB_NAME || 'todos';
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

// Middleware to parse JSON
app.use(express.json());

// GET /todos: Return all todos from database
app.get('/todos', async (req, res) => {
  try {
    const result = await dbClient.query('SELECT id, text FROM todos ORDER BY created_at');
    const todos = result.rows.map(row => ({ id: row.id, text: row.text }));
    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error.message);
    res.status(500).json({ error: 'Error fetching todos' });
  }
});

// POST /todos: Add new todo to database
app.post('/todos', async (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string' || text.length > 140) {
    return res.status(400).json({ error: 'Todo must be 1-140 chars string.' });
  }
  
  try {
    const result = await dbClient.query(
      'INSERT INTO todos (text) VALUES ($1) RETURNING id, text',
      [text]
    );
    const todo = result.rows[0];
    res.status(201).json({ message: 'Todo created', todo: { id: todo.id, text: todo.text } });
  } catch (error) {
    console.error('Error creating todo:', error.message);
    res.status(500).json({ error: 'Error creating todo' });
  }
});

// Start server after database is ready
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`todo-backend running on port ${PORT}`);
  });
});
