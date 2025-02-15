import Redis from "ioredis";

const redis = new Redis(); // Creates a single Redis connection

export default redis;
