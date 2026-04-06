// api/send-notification.js
import webpush from 'web-push';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

webpush.setVapidDetails(
  'mailto:ahmedbenhida@icloud.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { title, body } = req.body;
    const keys = await redis.keys('sub:*');

    const results = await Promise.allSettled(
      keys.map(async (key) => {
        const raw = await redis.get(key);
        const sub = typeof raw === 'string' ? JSON.parse(raw) : raw;
        return webpush.sendNotification(sub, JSON.stringify({ title, body }));
      })
    );

    const failed = results.filter(r => r.status === 'rejected');
    res.status(200).json({ sent: results.length, failed: failed.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}