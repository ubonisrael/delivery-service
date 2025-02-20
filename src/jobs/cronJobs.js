import cron from "node-cron";
import redis from "../utils/redisClient.js";

const cleanExpiredKeys = async () => {


  const keys = await redis.keys("chat:*"); // Get all chat-related keys

  for (const key of keys) {
    const ttl = await redis.ttl(key);
    if (ttl === -2) {

      await redis.del(key);
    }
  }


};

// Schedule job to run at midnight every day
cron.schedule("0 0 * * *", cleanExpiredKeys);
