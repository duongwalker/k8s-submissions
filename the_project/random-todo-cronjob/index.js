const axios = require('axios');

// Configuration from environment variables
const TODO_BACKEND_URL = process.env.TODO_BACKEND_URL || 'http://todo-backend-service.project/todos';

async function getRandomWikipediaArticle() {
  try {
    // Wikipedia Special:Random returns a redirect to a random article
    // We need to handle the redirect manually
    const response = await axios.get('https://en.wikipedia.org/wiki/Special:Random', {
      maxRedirects: 5,
      followRedirect: true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      }
    });
    
    // Extract the URL from the response - should be redirected to the article
    const articleUrl = response.request.res.responseUrl || response.config.url;
    
    if (!articleUrl) {
      throw new Error('Could not extract article URL from response');
    }
    
    return articleUrl;
  } catch (error) {
    console.error('Error fetching random Wikipedia article:', error.message);
    throw error;
  }
}

async function createTodo(text) {
  try {
    const response = await axios.post(TODO_BACKEND_URL, { text });
    console.log('Todo created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating todo:', error.message);
    throw error;
  }
}

async function main() {
  try {
    console.log('CronJob: Generating random Wikipedia reading todo...');
    
    // Get random Wikipedia article
    const wikipediaUrl = await getRandomWikipediaArticle();
    console.log('Random Wikipedia article:', wikipediaUrl);
    
    // Create todo with the Wikipedia URL
    const todoText = `Read ${wikipediaUrl}`;
    
    if (todoText.length > 140) {
      console.error('Todo text exceeds 140 characters:', todoText.length);
      process.exit(1);
    }
    
    await createTodo(todoText);
    console.log('Successfully created todo for reading Wikipedia article');
    process.exit(0);
  } catch (error) {
    console.error('CronJob failed:', error.message);
    process.exit(1);
  }
}

main();
