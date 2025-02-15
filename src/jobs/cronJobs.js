import cron from "node-cron";
import Redis from "ioredis";

const redis = new Redis();

const cleanExpiredKeys = async () => {
  console.log("Running daily Redis cleanup...");

  const keys = await redis.keys("chat:*"); // Get all chat-related keys

  for (const key of keys) {
    const ttl = await redis.ttl(key);
    if (ttl === -2) {
      console.log(`Deleting expired key: ${key}`);
      await redis.del(key);
    }
  }

  console.log("Redis cleanup complete.");
};

// Schedule job to run at midnight every day
cron.schedule("0 0 * * *", cleanExpiredKeys);
