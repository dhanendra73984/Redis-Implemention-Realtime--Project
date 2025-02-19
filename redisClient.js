const Redis = require("ioredis");

// Connect to Redis
const redis = new Redis({
  host: "127.0.0.1", // Redis server host
  port: 6379,        // Default Redis port
});

redis.on("connect", () => {
  console.log("🟢 Connected to Redis");
});

redis.on("error", (err) => {
  console.error("🔴 Redis Error:", err);
});

module.exports = redis;
