const fs = require('fs');
const crypto = require('crypto');

const randomString = crypto.randomBytes(16).toString('hex');
const filePath = '/usr/src/app/files/log.txt';

const writeLog = () => {
  const timestamp = new Date().toISOString();
  const logLine = `${timestamp}: ${randomString}\n`;
  
  fs.writeFileSync(filePath, logLine);
  console.log(`Written: ${logLine.trim()}`);
};

// Write every 5 seconds
setInterval(writeLog, 5000);

// Initial write
writeLog();

console.log('Writer started');
