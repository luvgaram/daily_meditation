// functions/api/checkout.js
import { Polar } from '@polar-sh/sdk';
import dotenv from 'dotenv';

dotenv.config({ path: '.dev.vars' });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const polar = new Polar({
      accessToken: process.env.POLAR_API_TOKEN,
      server: "sandbox",
    });

    // IMPORTANT: For Polar to redirect back to your local server,
    // the success_url must be a publicly accessible URL. When testing
    // locally, you can use a service like ngrok to expose your localhost.
    //
    // 1. Run `ngrok http 3000` in a separate terminal.
    // 2. Replace the placeholder below with the forwarding URL from ngrok.
    const successUrl = `${req.headers.origin}?payment_success=true`; // Replace req.headers.origin with your ngrok URL for local testing.
    // For example: const successUrl = `https://<your-ngrok-subdomain>.ngrok.io?payment_success=true`;
    
    const checkout = await polar.checkouts.create({
      products: [productId],
      success_url: successUrl,
    });

    return res.status(200).json({ checkout_url: checkout.url });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
