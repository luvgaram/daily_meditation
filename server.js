import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url'; // For __dirname equivalent

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// API route for the checkout function
app.post('/api/checkout', async (req, res) => {
  console.log('server.js received method:', req.method); // Add this line
  try {
    // Dynamically import the serverless function
    // This assumes the serverless function is written as an ES Module
    // and exports a default handler.
    const { default: handler } = await import(path.resolve(__dirname, 'functions/api/checkout.js'));
    
    // Call the serverless function handler
    await handler(req, res);
  } catch (error) {
    console.error('Error handling /api/checkout:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
