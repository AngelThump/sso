module.exports.limiter = (app) => {
  return async function (req, res, next) {
    if (
      req.headers["rate-limit-bypass"] ===
      app.get("authentication").RATE_LIMIT_BYPASS
    ) {
      return next();
    }

    app
      .get("rateLimiter")
      .consume(req.get("X-Real-IP") || req.ip)
      .then((rateLimiteRes) => {
        const headers = {
          "Retry-After": rateLimiteRes.msBeforeNext,
          "X-RateLimit-Limit": app.get("rateLimiter")._points,
          "X-RateLimit-Remaining": rateLimiteRes.remainingPoints,
          "X-RateLimit-Reset": Date.now() + rateLimiteRes.msBeforeNext,
        };
        res.set(headers);
        next();
      })
      .catch(() => {
        res.status(429).json({ error: true, msg: "Too Many Requests" });
      });
  };
};
