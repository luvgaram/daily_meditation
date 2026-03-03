// functions/api/checkout.js
import { Polar } from '@polar-sh/sdk';
import dotenv from 'dotenv';

// This default export is for the local Node.js server (server.js)
export default async function handler(req, res) {
  // Manually load .dev.vars for local development
  dotenv.config({ path: '.dev.vars' });
  
  console.log('checkout.js (local) received method:', req.method);
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

    const checkout = await polar.checkouts.create({
      products: [productId],
      success_url: `${req.headers.origin}?payment_success=true`,
    });

    return res.status(200).json({ checkout_url: checkout.url });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// This named export is for the Cloudflare Pages environment
export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { productId } = await request.json();

    if (!productId) {
      return new Response(JSON.stringify({ error: 'Product ID is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const polar = new Polar({
      accessToken: env.POLAR_API_TOKEN,
      server: "sandbox",
    });

    const origin = new URL(request.url).origin;

    const checkout = await polar.checkouts.create({
      products: [productId],
      success_url: `${origin}?payment_success=true`,
    });

    return new Response(JSON.stringify({ checkout_url: checkout.url }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
