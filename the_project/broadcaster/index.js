const { connect, StringCodec } = require('nats');
const axios = require('axios');

// Configuration
const NATS_URL = process.env.NATS_URL || 'nats://nats.nats:4222';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

const sc = StringCodec();

async function main() {
  try {
    // Connect to NATS
    const nc = await connect({
      servers: [NATS_URL],
      reconnect: true,
      maxReconnectAttempts: -1,
      reconnectDelayMS: 1000,
    });

    console.log(`[${new Date().toISOString()}] Connected to NATS at ${NATS_URL}`);

    // Subscribe to todo events with queue group (for load balancing)
    // Queue group ensures only one subscriber processes each message
    const sub = nc.subscribe('todo.*', { queue: 'broadcasters' });

    console.log(`[${new Date().toISOString()}] Listening for todo messages...`);

    (async () => {
      for await (const msg of sub) {
        try {
          const data = JSON.parse(sc.decode(msg.data));
          console.log(`[${new Date().toISOString()}] Received message on ${msg.subject}:`, data);

          // Create Telegram message
          let message = '';
          if (msg.subject === 'todo.created') {
            message = `✅ New Todo Created:\n📝 ${data.text}\n🆔 ID: ${data.id}`;
          } else if (msg.subject === 'todo.updated') {
            message = `✔️ Todo Marked as Done:\n📝 ${data.text}\n🆔 ID: ${data.id}`;
          }

          // Send to Telegram
          if (message) {
            await sendTelegramMessage(message);
          }

          // Acknowledge the message
          msg.respond();
        } catch (error) {
          console.error(`[${new Date().toISOString()}] Error processing message:`, error.message);
          // Don't acknowledge on error - let it be redelivered
        }
      }
    })();

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log(`\n[${new Date().toISOString()}] Shutting down...`);
      await nc.close();
      process.exit(0);
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Fatal error:`, error.message);
    process.exit(1);
  }
}

async function sendTelegramMessage(message) {
  try {
    const response = await axios.post(TELEGRAM_API, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML',
    });
    console.log(`[${new Date().toISOString()}] Message sent to Telegram successfully`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Failed to send Telegram message:`, error.message);
    throw error;
  }
}

main();
