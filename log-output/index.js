const { randomUUID } = require('crypto');
const randomString = randomUUID();

setInterval(() => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} ${randomString}`);
}, 5000);

