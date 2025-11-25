const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

const IMAGE_DIR = '/usr/src/app/images';
const IMAGE_PATH = path.join(IMAGE_DIR, 'image.jpg');
const IMAGE_URL = 'https://picsum.photos/1200';

// Ensure images directory exists
if (!fs.existsSync(IMAGE_DIR)) {
  fs.mkdirSync(IMAGE_DIR, { recursive: true });
}

async function fetchAndSaveImage() {
  console.log('Fetching new image from Picsum...');
  try {
    const response = await axios({
      url: IMAGE_URL,
      method: 'GET',
      responseType: 'stream'
    });

    const writer = fs.createWriteStream(IMAGE_PATH);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log('Image saved successfully');
        resolve();
      });
      writer.on('error', reject);
    });
  } catch (error) {
    console.error('Error fetching image:', error.message);
    throw error;
  }
}

async function ensureImage() {
  try {
    if (!fs.existsSync(IMAGE_PATH)) {
      console.log('No image found, downloading...');
      await fetchAndSaveImage();
    } else {
      const stats = fs.statSync(IMAGE_PATH);
      const now = new Date();
      const lastModified = new Date(stats.mtime);
      const ageInMinutes = (now - lastModified) / (1000 * 60);

      console.log(`Image age: ${ageInMinutes.toFixed(2)} minutes`);

      if (ageInMinutes > 10) {
        console.log('Image is older than 10 minutes, downloading new one...');
        await fetchAndSaveImage();
      } else {
        console.log('Using cached image');
      }
    }
  } catch (error) {
    console.error('Error in ensureImage:', error.message);
  }
}

app.get('/', async (req, res) => {
  await ensureImage();
  
  res.set('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>The project App</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 50px auto;
                text-align: center;
            }
            h1 {
                margin-bottom: 30px;
            }
            img {
                max-width: 100%;
                height: auto;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .footer {
                margin-top: 20px;
                font-size: 14px;
                color: #666;
            }
        </style>
    </head>
    <body>
        <h1>The project App</h1>
        <img src="/image" alt="Random image from Picsum">
        <div class="footer">DevOps with Kubernetes 2025</div>
    </body>
    </html>
  `);
});

app.get('/image', (req, res) => {
  if (fs.existsSync(IMAGE_PATH)) {
    res.sendFile(IMAGE_PATH);
  } else {
    res.status(404).send('Image not found');
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
