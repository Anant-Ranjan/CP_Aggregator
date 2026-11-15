import Redis from 'ioredis';

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

const redis = new Redis({
  host: redisHost,
  port: redisPort,
  retryStrategy(times) {
    // Retry up to 5 times, delay between 50ms and 2000ms
    if (times > 5) {
      return null; // Stop retrying if redis is not running locally during tests
    }
    return Math.min(times * 100, 2000);
  },
  lazyConnect: true,
});

redis.on('error', (err) => {
  console.warn('Redis client error:', err.message);
});

export default redis;
