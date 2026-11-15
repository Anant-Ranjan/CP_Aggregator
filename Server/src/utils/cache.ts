import redis from '../config/redisClient';

export async function getOrSetCache<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
  } catch (err) {
    console.warn(`Redis get failed for key ${key}:`, (err as Error).message);
  }

  const fresh = await fetcher();

  try {
    await redis.set(key, JSON.stringify(fresh), 'EX', ttlSeconds);
  } catch (err) {
    console.warn(`Redis set failed for key ${key}:`, (err as Error).message);
  }

  return fresh;
}
