const express = require('express');
const app = express();

let counter = 0;

const PORT = process.env.PORT || 3000;

app.get('/pingpong', (req, res) => {
  res.send(`pong ${counter}`);
  counter++;
});

app.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
});
