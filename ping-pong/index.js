const express = require('express');
const fs = require('fs');
const app = express();

const PORT = process.env.PORT || 3000;
const counterFile = '/usr/src/app/data/counter.txt';

// Read counter from file or start at 0
let counter = 0;
if (fs.existsSync(counterFile)) {
  try {
    counter = parseInt(fs.readFileSync(counterFile, 'utf8')) || 0;
  } catch (err) {
    console.log('Starting counter at 0');
  }
}

app.get('/pingpong', (req, res) => {
  res.send(`pong ${counter}`);
  counter++;
  
  // Write counter to file
  fs.writeFileSync(counterFile, counter.toString());
});

app.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
});
