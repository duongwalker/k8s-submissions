const express = require('express');
const app = express();

let counter = 0;

const PORT = process.env.PORT || 3000;

// Existing endpoint that increments counter
app.get('/pingpong', (req, res) => {
  res.send(`pong ${counter}`);
  counter++;
  console.log(`Counter incremented: ${counter}`);
});

// NEW endpoint that returns counter without incrementing
app.get('/pingpongs', (req, res) => {
  res.json({ counter: counter });
  console.log(`Counter requested: ${counter}`);
});

app.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
});
