const express = require('express');
const fs = require('fs');
const app = express();

const PORT = process.env.PORT || 3000;
const logFile = '/usr/src/app/files/log.txt';
const counterFile = '/usr/src/app/data/counter.txt';

app.get('/', (req, res) => {
  try {
    const logContent = fs.readFileSync(logFile, 'utf8').trim();
    
    let counter = 0;
    if (fs.existsSync(counterFile)) {
      counter = parseInt(fs.readFileSync(counterFile, 'utf8')) || 0;
    }
    
    const output = `${logContent}\nPing / Pongs: ${counter}`;
    res.send(output);
  } catch (error) {
    res.status(500).send('Error reading files');
  }
});

app.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
});
