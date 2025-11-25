const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

const IMAGE_DIR = '/usr/src/app/images';
const IMAGE_PATH = path.join(IMAGE_DIR, 'image.jpg');
const IMAGE_URL = 'https://picsum.photos/1200';
const TODO_BACKEND_URL = process.env.TODO_BACKEND_URL || 'http://todo-backend-service/todos';

// Parse form data
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

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
  
  let todos = [];
  try {
    const response = await axios.get(TODO_BACKEND_URL);
    todos = response.data;
  } catch (err) {
    console.error('Error fetching todos:', err.message);
    todos = [];
  }

  const todoListHTML = todos.map(todo => `<li>${todo.text}</li>`).join('');
  
  res.set('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>The project App</title>
    </head>
    <body>
        <h1>The project App</h1>
        <img src="/image" alt="Random image from Picsum" style="max-width: 100%; border-radius: 8px;">
        
        <div>
            <h2>My Todos</h2>
            
            <form method="POST" action="/add-todo">
                <input type="text" name="todo" maxlength="140" placeholder="Add a new todo (max 140 characters)" required />
                <button type="submit">Send</button>
            </form>
            
            <ul>
                ${todoListHTML}
            </ul>
        </div>
        
        <div style="margin-top: 40px; font-size: 14px; color: #666;">
            DevOps with Kubernetes 2025
        </div>
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

app.post('/add-todo', async (req, res) => {
  const text = req.body.todo;
  
  if (!text || text.trim().length === 0) {
    return res.redirect('/');
  }
  
  if (text.length > 140) {
    return res.redirect('/');
  }
  
  try {
    await axios.post(TODO_BACKEND_URL, { text });
    console.log('Todo created:', text);
  } catch (err) {
    console.error('Error creating todo:', err.message);
  }
  
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
