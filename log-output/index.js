const express = require('express');
const app = express();

// Store the random string and timestamp
const randomString = require('crypto').randomBytes(16).toString('hex');
const startTime = new Date();

const PORT = process.env.PORT || 3000;

// Endpoint to get current status
app.get('/', (req, res) => {
  const currentTime = new Date();
  res.json({
    timestamp: currentTime.toISOString(),
    random_string: randomString,
    uptime_ms: currentTime - startTime
  });
});

app.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
});
