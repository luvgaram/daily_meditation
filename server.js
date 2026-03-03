import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { Polar } from '@polar-sh/sdk';

// Load environment variables from .dev.vars for local development
dotenv.config({ path: path.resolve(process.cwd(), '.dev.vars') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// API route for the checkout function - FOR LOCAL DEVELOPMENT
// This duplicates the logic from functions/api/checkout.js for simplicity,
// avoiding the need to perfectly mock the Cloudflare Pages environment.
app.post('/api/checkout', async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const polar = new Polar({
      accessToken: process.env.POLAR_API_TOKEN,
      server: "sandbox",
    });

    // Use a hardcoded origin for local testing, or derive it from the request
    const origin = `http://localhost:${port}`;

    const checkout = await polar.checkouts.create({
      products: [productId],
      success_url: `${origin}?payment_success=true`,
    });

    return res.status(200).json({ checkout_url: checkout.url });
  } catch (error) {
    console.error('Error in local /api/checkout:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
