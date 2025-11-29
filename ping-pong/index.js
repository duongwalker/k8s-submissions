const express = require('express');
const app = express();

const PORT = process.env.PORT || 8080;

// In-memory counter for serverless (no database dependency)
let counter = 0;

// Health check endpoint - main endpoint that increments counter
app.get('/', async (req, res) => {
  try {
    counter++;
    res.send(`pong ${counter}`);
    console.log(`Counter incremented to: ${counter}`);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Error');
  }
});

// Liveness probe for Knative
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
