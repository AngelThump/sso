const recaptcha = require("./recaptcha");
const sns = require("./sns");
const { login, logout } = require("./auth");
const { authenticate } = require("@feathersjs/express");
const validation = require("./validation");
const user = require("./user");
const patreon = require("./patreon");
const { limiter } = require("./rateLimit");
const session = require("express-session");
const RedisStore = require("connect-redis").default;

module.exports = function (app) {
  app.use(
    session({
      store: new RedisStore({ client: app.get("redisClient") }),
      secret: app.get("authentication").secret,
      ...app.get("authentication").session,
    })
  );

  app.post("/v1/sns", sns(app));

  app.get("/user/reset/password/:hash", (req, res, next) => res.render("reset_password.ejs", { hash: req.params.hash }));

  app.get("/user/verify/:hash", limiter(app), user.verify(app));
  app.post("/v1/user/reset-password", limiter(app), user.resetPassword(app));
  app.post("/v1/user/password", limiter(app), [recaptcha.verify(app), user.sendResetPassword(app)]);
  app.post("/v1/user/change/password", limiter(app), authenticate("jwt"), user.changePassword(app));
  app.post("/v1/user/change/email", limiter(app), authenticate("jwt"), user.emailChange(app));
  app.get("/user/change/email/:hash", limiter(app), user.verifyEmailChange(app));
  app.post("/v1/user/username", limiter(app), [recaptcha.verify(app), user.getUsername(app)]);

  app.post("/v1/user/verify/password", limiter(app), authenticate("jwt"), user.verifyPassword(app));
  app.post("/v1/user/verify/patreon", limiter(app), authenticate("jwt"), patreon.verifyPatreon(app));
  app.delete("/v1/user/profile-logo", limiter(app), authenticate("jwt"), user.deleteProfileLogo(app));
  app.delete("/v1/user/offline-banner", limiter(app), authenticate("jwt"), user.deleteOfflineBanner(app));
  app.delete("/v1/user/patreon", limiter(app), authenticate("jwt"), patreon.deletePatreon(app));
  app.delete("/v1/user/twitch", limiter(app), authenticate("jwt"), user.deleteTwitch(app));
  app.put("/v1/user/stream-key", limiter(app), authenticate("jwt"), user.resetStreamKey(app));
  app.put("/v1/user/display-name", limiter(app), authenticate("jwt"), user.changeDisplayName(app));
  app.put("/v1/user/username", limiter(app), authenticate("jwt"), user.changeUsername(app));
  app.put("/v1/user/nsfw", limiter(app), authenticate("jwt"), user.changeNSFW(app));
  app.put("/v1/user/email", limiter(app), authenticate("jwt"), user.changeEmail(app));
  app.patch("/v1/user/unlist", limiter(app), authenticate("jwt"), user.patchUnlist(app));
  app.patch("/v1/user/password_protect", limiter(app), authenticate("jwt"), user.patchPasswordProtect(app));
  app.patch("/v1/user/stream_password", limiter(app), authenticate("jwt"), user.patchStreamPassword(app));

  app.post("/v1/signup", limiter(app), [recaptcha.verify(app), user.signup(app)]);
  app.post("/login", limiter(app), login(app));
  app.delete("/logout", limiter(app), logout(app));

  app.post("/v1/validation/username", validation.username(app));
  app.post("/v1/validation/email", validation.email(app));
};
