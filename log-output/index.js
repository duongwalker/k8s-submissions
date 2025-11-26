const express = require('express');
const fs = require('fs');
const app = express();

const PORT = process.env.PORT || 3000;
const configFile = '/usr/src/app/config/information.txt';
const MESSAGE = process.env.MESSAGE || 'not set';

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

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
