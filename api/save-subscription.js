// api/save-subscription.js
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const subscription = req.body;
    const key = `sub:${Buffer.from(subscription.endpoint).toString('base64').slice(-20)}`;
    await redis.set(key, JSON.stringify(subscription));
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}