const recaptcha = require("./recaptcha");
const sns = require("./sns");
const { login, logout } = require("./auth");
const { authenticate } = require("@feathersjs/express");
const validation = require("./validation");
const user = require("./user");
const patreon = require("./patreon");
const session = require("express-session");
const RedisStore = require("connect-redis").default;
const { createClient } = require("redis");

module.exports = function (app) {
  const redisConf = app.get("authentication").session.redis,
    redisClient = createClient(
      redisConf.useUnixSocket
        ? {
            socket: {
              path: redisConf.unix,
            },
            password: redisConf.password,
            legacyMode: true,
          }
        : {
            socket: {
              host: redisConf.hostname,
            },
            password: redisConf.password,
            legacyMode: true,
          }
    );
  redisClient.connect().catch((e) => console.error(e));

  const limiter = require("express-limiter")(app, redisClient);
  limiter({
    path: "*",
    method: "post",
    lookup: "headers.x-forwarded-for",
    total: 5,
    expire: 1000 * 5,
    onRateLimited: (req, res, next) => {
      next({ message: "Rate limit exceeded", code: 429 });
    },
    whitelist: function (req) {
      return (
        req.headers["rate-limit-bypass"] ===
        app.get("authentication").RATE_LIMIT_BYPASS
      );
    },
  });

  app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      secret: app.get("authentication").secret,
      ...app.get("authentication").session,
    })
  );

  app.post("/v1/sns", sns(app));

  app.get("/user/reset/password/:hash", (req, res, next) =>
    res.render("reset_password.ejs", { hash: req.params.hash })
  );

  app.get("/user/verify/:hash", user.verify(app));
  app.post("/v1/user/reset-password", user.resetPassword(app));
  app.post("/v1/user/password", [
    recaptcha.verify(app),
    user.sendResetPassword(app),
  ]);
  app.post(
    "/v1/user/change/password",
    authenticate("jwt"),
    user.changePassword(app)
  );
  app.post("/v1/user/change/email", authenticate("jwt"), user.emailChange(app));
  app.get("/user/change/email/:hash", user.verifyEmailChange(app));
  app.post("/v1/user/username", [recaptcha.verify(app), user.getUsername(app)]);

  app.post(
    "/v1/user/verify/password",
    authenticate("jwt"),
    user.verifyPassword(app)
  );
  app.post(
    "/v1/user/verify/patreon",
    authenticate("jwt"),
    patreon.verifyPatreon(app)
  );
  app.delete(
    "/v1/user/profile-logo",
    authenticate("jwt"),
    user.deleteProfileLogo(app)
  );
  app.delete(
    "/v1/user/offline-banner",
    authenticate("jwt"),
    user.deleteOfflineBanner(app)
  );
  app.delete(
    "/v1/user/patreon",
    authenticate("jwt"),
    patreon.deletePatreon(app)
  );
  app.delete("/v1/user/twitch", authenticate("jwt"), user.deleteTwitch(app));
  app.put("/v1/user/stream-key", authenticate("jwt"), user.resetStreamKey(app));
  app.put(
    "/v1/user/display-name",
    authenticate("jwt"),
    user.changeDisplayName(app)
  );
  app.put("/v1/user/username", authenticate("jwt"), user.changeUsername(app));
  app.put("/v1/user/nsfw", authenticate("jwt"), user.changeNSFW(app));
  app.put("/v1/user/email", authenticate("jwt"), user.changeEmail(app));
  app.patch("/v1/user/unlist", authenticate("jwt"), user.patchUnlist(app));
  app.patch(
    "/v1/user/password_protect",
    authenticate("jwt"),
    user.patchPasswordProtect(app)
  );
  app.patch(
    "/v1/user/stream_password",
    authenticate("jwt"),
    user.patchStreamPassword(app)
  );

  app.post("/v1/signup", [recaptcha.verify(app), user.signup(app)]);
  app.post("/login", login(app));
  app.delete("/logout", logout(app));

  app.post("/v1/validation/username", validation.username(app));
  app.post("/v1/validation/email", validation.email(app));
};
