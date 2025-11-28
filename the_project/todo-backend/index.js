const express = require('express');
const { Client } = require('pg');
const morgan = require('morgan');
const { connect } = require('nats');
const app = express();
const PORT = process.env.PORT || 3000;

// Database configuration from environment variables
const DB_HOST = process.env.DB_HOST || 'todo-postgres';
const DB_PORT = process.env.DB_PORT || 5432;
const DB_NAME = process.env.DB_NAME || 'todos';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';

// NATS configuration
const NATS_URL = process.env.NATS_URL || 'nats://nats.nats:4222';

// PostgreSQL client connection string
const connectionString = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

// Custom logger that logs all requests
const logger = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration_ms: duration,
      content_length: res.get('content-length') || 0,
      body: req.body ? JSON.stringify(req.body) : null
    };
    console.log(JSON.stringify(logEntry));
  });
  
  next();
};

// Initialize database connection
let dbClient;
let natsConnection;

async function initializeNats() {
  try {
    natsConnection = await connect({
      servers: [NATS_URL],
      reconnect: true,
      maxReconnectAttempts: -1,
      reconnectDelayMS: 1000,
    });
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), event: 'NATS_CONNECTED', url: NATS_URL }));
  } catch (error) {
    console.error(JSON.stringify({ timestamp: new Date().toISOString(), event: 'NATS_CONNECT_FAILED', error: error.message }));
    // Continue anyway - NATS is optional for now
  }
}

async function publishToNats(subject, data) {
  if (!natsConnection) return;
  try {
    const encoder = new TextEncoder();
    natsConnection.publish(subject, encoder.encode(JSON.stringify(data)));
  } catch (error) {
    console.error(JSON.stringify({ timestamp: new Date().toISOString(), event: 'NATS_PUBLISH_ERROR', error: error.message }));
  }
}

async function initializeDatabase() {
  dbClient = new Client({ connectionString });
  
  let retries = 30;
  while (retries > 0) {
    try {
      await dbClient.connect();
      console.log(JSON.stringify({ timestamp: new Date().toISOString(), event: 'DATABASE_CONNECTED' }));
      break;
    } catch (error) {
      retries--;
      if (retries === 0) {
        console.error(JSON.stringify({ timestamp: new Date().toISOString(), event: 'DATABASE_CONNECT_FAILED', error: error.message }));
        process.exit(1);
      }
      console.log(JSON.stringify({ timestamp: new Date().toISOString(), event: 'DATABASE_RETRY', retries_left: retries }));
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// Middleware setup
app.use(express.json());
app.use(logger);

// GET /todos: Return all todos from database
app.get('/todos', async (req, res) => {
  try {
    const result = await dbClient.query('SELECT id, text, done FROM todos ORDER BY created_at');
    const todos = result.rows.map(row => ({ id: row.id, text: row.text, done: row.done }));
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), event: 'TODOS_FETCHED', count: todos.length }));
    res.json(todos);
  } catch (error) {
    console.error(JSON.stringify({ timestamp: new Date().toISOString(), event: 'ERROR', endpoint: '/todos', error: error.message }));
    res.status(500).json({ error: 'Error fetching todos' });
  }
});

// GET /health: Readiness probe - check database connectivity
app.get('/health', async (req, res) => {
  try {
    await dbClient.query('SELECT 1');
    res.status(200).json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: error.message });
  }
});

// POST /todos: Add new todo to database
app.post('/todos', async (req, res) => {
  const { text } = req.body;
  
  // Validate todo text
  if (!text || typeof text !== 'string') {
    console.log(JSON.stringify({ 
      timestamp: new Date().toISOString(), 
      event: 'INVALID_TODO', 
      reason: 'text is missing or not a string',
      received: text 
    }));
    return res.status(400).json({ error: 'Todo must be 1-140 chars string.' });
  }
  
  if (text.length === 0) {
    console.log(JSON.stringify({ 
      timestamp: new Date().toISOString(), 
      event: 'INVALID_TODO', 
      reason: 'text is empty',
      length: 0 
    }));
    return res.status(400).json({ error: 'Todo must be 1-140 chars string.' });
  }
  
  if (text.length > 140) {
    console.log(JSON.stringify({ 
      timestamp: new Date().toISOString(), 
      event: 'INVALID_TODO', 
      reason: 'text exceeds 140 characters',
      length: text.length,
      text: text.substring(0, 50) + '...' 
    }));
    return res.status(400).json({ error: 'Todo must be 1-140 chars string.' });
  }
  
  try {
    const result = await dbClient.query(
      'INSERT INTO todos (text) VALUES ($1) RETURNING id, text',
      [text]
    );
    const todo = result.rows[0];
    console.log(JSON.stringify({ 
      timestamp: new Date().toISOString(), 
      event: 'TODO_CREATED', 
      id: todo.id, 
      length: text.length,
      text: text 
    }));
    
    // Publish to NATS
    await publishToNats('todo.created', {
      id: todo.id,
      text: todo.text,
      done: false,
      timestamp: new Date().toISOString()
    });
    
    res.status(201).json({ message: 'Todo created', todo: { id: todo.id, text: todo.text } });
  } catch (error) {
    console.error(JSON.stringify({ timestamp: new Date().toISOString(), event: 'ERROR', endpoint: '/todos', error: error.message }));
    res.status(500).json({ error: 'Error creating todo' });
  }
});

// PUT /todos/:id: Mark todo as done
app.put('/todos/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await dbClient.query(
      'UPDATE todos SET done = TRUE WHERE id = $1 RETURNING id, text, done',
      [id]
    );
    
    if (result.rows.length === 0) {
      console.log(JSON.stringify({ 
        timestamp: new Date().toISOString(), 
        event: 'TODO_NOT_FOUND', 
        id: id 
      }));
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    const todo = result.rows[0];
    console.log(JSON.stringify({ 
      timestamp: new Date().toISOString(), 
      event: 'TODO_MARKED_DONE', 
      id: todo.id, 
      text: todo.text 
    }));
    
    // Publish to NATS
    await publishToNats('todo.updated', {
      id: todo.id,
      text: todo.text,
      done: true,
      timestamp: new Date().toISOString()
    });
    
    res.json({ message: 'Todo marked as done', todo });
  } catch (error) {
    console.error(JSON.stringify({ timestamp: new Date().toISOString(), event: 'ERROR', endpoint: '/todos/:id', error: error.message }));
    res.status(500).json({ error: 'Error updating todo' });
  }
});

// Start server after database is ready
initializeDatabase().then(async () => {
  await initializeNats();
  app.listen(PORT, () => {
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), event: 'SERVER_STARTED', port: PORT }));
  });
});
