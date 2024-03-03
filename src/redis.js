const { createClient } = require("redis");
const { RateLimiterRedis } = require("rate-limiter-flexible");

module.exports = async function (app) {
  const redisConf = app.get("authentication").redis,
    redisClient = createClient({
      socket: {
        path: redisConf.useUnixSocket ? redisConf.unix : null,
        host: redisConf.hostname,
      },
      password: redisConf.password,
      enable_offline_queue: false,
    });

  redisClient.connect().catch((e) => console.error(e));

  app.set("redisClient", redisClient);

  const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: "middleware",
    points: 20,
    duration: 5,
    useRedisPackage: true,
  });

  app.set("rateLimiter", rateLimiter);
};
