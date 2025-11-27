const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

const IMAGE_DIR = '/usr/src/app/images';
const IMAGE_PATH = path.join(IMAGE_DIR, 'image.jpg');
const IMAGE_URL = process.env.IMAGE_URL || 'https://picsum.photos/1200';
const IMAGE_CACHE_TTL_MINUTES = parseInt(process.env.IMAGE_CACHE_TTL_MINUTES) || 10;
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

      if (ageInMinutes > IMAGE_CACHE_TTL_MINUTES) {
        console.log(`Image is older than ${IMAGE_CACHE_TTL_MINUTES} minutes, downloading new one...`);
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

  const activeTodos = todos.filter(todo => !todo.done);
  const doneTodos = todos.filter(todo => todo.done);

  const activeTodoListHTML = activeTodos.map(todo => `
    <li>
      <span>${todo.text}</span>
      <button onclick="markAsDone(${todo.id})" style="margin-left: 10px;">Mark as done</button>
    </li>
  `).join('');

  const doneTodoListHTML = doneTodos.map(todo => `
    <li style="color: #888; text-decoration: line-through;">${todo.text}</li>
  `).join('');
  
  res.set('Content-Type', 'text/html');
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>The Project App</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          button {
            padding: 5px 10px;
            cursor: pointer;
          }
          ul {
            list-style: none;
            padding: 0;
          }
          li {
            padding: 8px;
            margin: 5px 0;
            background: #f5f5f5;
            border-radius: 4px;
          }
          .done-section {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #ddd;
          }
        </style>
    </head>
    <body>
        <h1>The Project App</h1>
        <img src="/image" alt="Random image from Picsum" style="max-width: 100%; border-radius: 8px;">
        
        <div>
            <h2>My Todos</h2>
            
            <form method="POST" action="/add-todo">
                <input type="text" name="todo" maxlength="140" placeholder="Add a new todo (max 140 characters)" required />
                <button type="submit">Send</button>
            </form>
            
            <ul>
                ${activeTodoListHTML}
            </ul>
        </div>

        ${doneTodos.length > 0 ? `
        <div class="done-section">
            <h2>Done</h2>
            <ul>
                ${doneTodoListHTML}
            </ul>
        </div>
        ` : ''}
        
        <div style="margin-top: 40px; font-size: 14px; color: #666;">
            DevOps with Kubernetes 2025
        </div>

        <script>
          async function markAsDone(todoId) {
            try {
              console.log('Sending PUT request for todo:', todoId);
              const response = await fetch('/todos/' + todoId, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json'
                }
              });
              console.log('Response status:', response.status);
              if (response.ok) {
                location.reload();
              } else {
                const errData = await response.text();
                console.error('Error response:', errData);
                alert('Error marking todo as done: ' + response.status);
              }
            } catch (err) {
              console.error('Error:', err);
              alert('Error marking todo as done: ' + err.message);
            }
          }
        </script>
    </body>
    </html>
  `;
  res.send(html);
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

app.put('/todos/:id', async (req, res) => {
  const { id } = req.params;
  console.log('PUT /todos/:id received, id:', id);
  
  try {
    console.log('Making request to:', `${TODO_BACKEND_URL}/${id}`);
    const response = await axios.put(`${TODO_BACKEND_URL}/${id}`);
    console.log('Backend response:', response.data);
    res.json(response.data);
  } catch (err) {
    console.error('Error marking todo as done:', err.message);
    res.status(500).json({ error: 'Error marking todo as done', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
