const express = require('express');
const fs = require('fs');
const http = require('http');
const app = express();

const PORT = process.env.PORT || 3000;
const configFile = '/usr/src/app/config/information.txt';
const MESSAGE = process.env.MESSAGE || 'not set';
const PING_PONG_URL = process.env.PING_PONG_URL || 'http://ping-pong-service/pingpongs';

app.get('/', (req, res) => {
  let configContent = 'config file not found';
  
  try {
    configContent = fs.readFileSync(configFile, 'utf8').trim();
  } catch (error) {
    // silently fail, use default
  }
  
  const output = `file content: ${configContent}\nenv variable: MESSAGE=${MESSAGE}`;
  res.send(output);
});

// Readiness probe - check if ping-pong is reachable
app.get('/ready', (req, res) => {
  const url = new URL(PING_PONG_URL);
  const options = {
    hostname: url.hostname,
    port: url.port || 80,
    path: url.pathname,
    method: 'GET',
    timeout: 2000
  };

  const request = http.request(options, (response) => {
    if (response.statusCode === 200) {
      res.status(200).send('Ready');
    } else {
      res.status(503).send('Not ready');
    }
  });

  request.on('error', () => {
    res.status(503).send('Not ready');
  });

  request.on('timeout', () => {
    request.destroy();
    res.status(503).send('Not ready');
  });

  request.end();
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

