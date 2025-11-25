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

// Hardcoded todos
const hardcodedTodos = [
  'Learn Kubernetes',
  'Deploy application to cluster',
  'Set up persistent volumes',
  'Configure ingress routing',
  'Implement todo app functionality'
];

app.get('/', async (req, res) => {
  await ensureImage();
  
  const todoListHTML = hardcodedTodos.map(todo => `<li>${todo}</li>`).join('');
  
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
                padding: 20px;
            }
            h1 {
                text-align: center;
                margin-bottom: 30px;
            }
            img {
                max-width: 100%;
                height: auto;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                margin-bottom: 30px;
            }
            .todo-section {
                background-color: #f5f5f5;
                padding: 20px;
                border-radius: 8px;
                margin-top: 30px;
            }
            h2 {
                margin-top: 0;
            }
            .input-container {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
            }
            #todoInput {
                flex: 1;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
            }
            #todoInput.error {
                border-color: #ff6b6b;
                background-color: #ffe0e0;
            }
            button {
                padding: 10px 20px;
                background-color: #007bff;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
            }
            button:hover {
                background-color: #0056b3;
            }
            .char-count {
                font-size: 12px;
                color: #666;
                margin-top: 5px;
            }
            .char-count.warning {
                color: #ff6b6b;
            }
            ul {
                list-style: none;
                padding: 0;
            }
            li {
                padding: 10px;
                background-color: white;
                margin-bottom: 10px;
                border-radius: 4px;
                border-left: 4px solid #007bff;
            }
            .footer {
                margin-top: 40px;
                text-align: center;
                font-size: 14px;
                color: #666;
            }
        </style>
    </head>
    <body>
        <h1>The project App</h1>
        <img src="/image" alt="Random image from Picsum">
        
        <div class="todo-section">
            <h2>My Todos</h2>
            
            <div class="input-container">
                <input 
                    type="text" 
                    id="todoInput" 
                    placeholder="Add a new todo (max 140 characters)" 
                    maxlength="140"
                />
                <button onclick="addTodo()">Send</button>
            </div>
            <div class="char-count">
                <span id="charCount">0</span>/140 characters
            </div>
            
            <ul id="todoList">
                ${todoListHTML}
            </ul>
        </div>
        
        <div class="footer">DevOps with Kubernetes 2025</div>
        
        <script>
            const todoInput = document.getElementById('todoInput');
            const charCount = document.getElementById('charCount');
            
            // Update character count
            todoInput.addEventListener('input', function() {
                charCount.textContent = this.value.length;
                
                if (this.value.length > 120) {
                    charCount.parentElement.classList.add('warning');
                } else {
                    charCount.parentElement.classList.remove('warning');
                }
                
                // Visual feedback for max length
                if (this.value.length >= 140) {
                    this.classList.add('error');
                } else {
                    this.classList.remove('error');
                }
            });
            
            function addTodo() {
                const todoText = todoInput.value.trim();
                
                if (todoText === '') {
                    alert('Please enter a todo');
                    return;
                }
                
                if (todoText.length > 140) {
                    alert('Todo must be 140 characters or less');
                    return;
                }
                
                // For now, just show an alert
                alert('Todo will be saved: ' + todoText);
                todoInput.value = '';
                charCount.textContent = '0';
                charCount.parentElement.classList.remove('warning');
            }
            
            // Allow sending todo with Enter key
            todoInput.addEventListener('keypress', function(event) {
                if (event.key === 'Enter') {
                    addTodo();
                }
            });
        </script>
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
