// functions/api/checkout.js
import { Polar } from '@polar-sh/sdk';

// This named export is for the Cloudflare Pages environment
export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { productId } = await request.json();

    if (!productId) {
      return new Response(JSON.stringify({ error: 'Product ID is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // In Cloudflare, env variables are on the context
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
