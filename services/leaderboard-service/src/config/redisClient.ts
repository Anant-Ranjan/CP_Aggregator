import Redis from 'ioredis';

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

const redis = new Redis({
  host: redisHost,
  port: redisPort,
  retryStrategy(times) {
    if (times > 5) {
      return null;
    }
    return Math.min(times * 100, 2000);
  },
  lazyConnect: true,
});

redis.on('error', (err) => {
  console.warn('Redis client error:', err.message);
});

export default redis;
