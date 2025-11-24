const express = require('express');
const fs = require('fs');
const app = express();

const PORT = process.env.PORT || 3000;
const filePath = '/usr/src/app/files/log.txt';

app.get('/', (req, res) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    res.send(content);
  } catch (error) {
    res.status(500).send('Error reading file');
  }
});

app.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
});
