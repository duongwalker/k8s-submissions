const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

let todos = [
  { text: 'Learn Kubernetes' },
  { text: 'Deploy application to cluster' },
  { text: 'Set up persistent volumes' }
];

// Middleware to parse JSON
app.use(express.json());

// GET /todos: Return todos
app.get('/todos', (req, res) => {
  res.json(todos);
});

// POST /todos: Add new todo
app.post('/todos', (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string' || text.length > 140) {
    return res.status(400).json({ error: 'Todo must be 1-140 chars string.' });
  }
  todos.push({ text });
  res.status(201).json({ message: 'Todo created', todo: { text } });
});

app.listen(PORT, () => {
  console.log(`todo-backend running on port ${PORT}`);
});
