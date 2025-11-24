// src/shared/lib/redis.ts
import { Redis } from '@upstash/redis';

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.error('Upstash Redis environment variables are not set. Redis client will not be initialized.');
  // Assign a mock/dummy object if you want to avoid hard errors in environments without redis
  // For simplicity, we'll let it error out if used without proper setup,
  // but in a real app, you might handle this more gracefully.
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
