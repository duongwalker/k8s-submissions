const express = require('express');
const fs = require('fs');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;
const logFile = '/usr/src/app/files/log.txt';
const PING_PONG_URL = process.env.PING_PONG_URL || 'http://ping-pong-service/pingpongs';

app.get('/', async (req, res) => {
  try {
    const logContent = fs.readFileSync(logFile, 'utf8').trim();
    
    // Fetch counter from ping-pong service via HTTP
    let counter = 0;
    try {
      const response = await axios.get(PING_PONG_URL);
      counter = response.data.counter;
    } catch (error) {
      console.error('Error fetching counter from ping-pong:', error.message);
    }
    
    const output = `${logContent}\nPing / Pongs: ${counter}`;
    res.send(output);
  } catch (error) {
    res.status(500).send('Error reading files');
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
