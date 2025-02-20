import Redis from "ioredis";

const redis = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
    username: process.env.REDIS_USERNAME || undefined,
    password: process.env.REDIS_PASSWD || undefined,
    retryStrategy: (times) => (times > 10 ? null : Math.min(times * 50, 2000)),
  });
export default redis;
