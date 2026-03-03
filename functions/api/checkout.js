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
