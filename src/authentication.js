const { AuthenticationService, JWTStrategy, AuthenticationBaseStrategy } = require("@feathersjs/authentication");
const { LocalStrategy } = require("@feathersjs/authentication-local");
const { oauth, OAuthStrategy } = require("@feathersjs/authentication-oauth");
const axios = require("axios");
const session = require("express-session");
const RedisStore = require("connect-redis").default;

class PatreonStrategy extends OAuthStrategy {
  constructor(app) {
    super(app);
  }

  async getProfile(res, params) {
    const accessToken = res.access_token;

    let { data } = await axios.get("https://www.patreon.com/api/oauth2/v2/identity", {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    data.access_token = res.access_token;
    data.refresh_token = res.refresh_token;

    return data;
  }

  getEntityData(profile) {
    return {
      patreon: {
        id: profile.data.id,
        isPatron: false,
        tier: 0,
        access_token: profile.access_token,
        refresh_token: profile.refresh_token,
      },
    };
  }

  getEntityQuery(profile) {
    const query = { "patreon.id": profile.data.id };
    return {
      ...query,
      $limit: 1,
    };
  }

  async getRedirect(data) {
    return `${this.app.get("authentication").oauth.redirect}`;
  }
}

class TwitchStrategy extends OAuthStrategy {
  constructor(app) {
    super(app);
  }

  getEntityData(profile) {
    const user = profile && profile.data[0];
    if (!user) throw new Error("No User Found");
    return {
      twitch: {
        id: user.id,
        channel: user.login,
      },
    };
  }

  getEntityQuery(profile) {
    const user = profile && profile.data[0];
    if (!user) throw new Error("No User Found");
    const query = { "twitch.id": user.id };
    return {
      ...query,
      $limit: 1,
    };
  }

  async getRedirect(data) {
    return `${this.app.get("authentication").oauth.redirect}`;
  }
}

module.exports = (app) => {
  const authentication = new AuthenticationService(app);

  authentication.register("jwt", new JWTStrategy());
  authentication.register("local", new LocalStrategy());
  authentication.register("patreon", new PatreonStrategy(app));
  authentication.register("twitch", new TwitchStrategy(app));
  authentication.register("apiKey", new ApiKeyStrategy());

  app.use("/authentication", authentication);
  app.configure(
    oauth({
      expressSession: session({
        store: new RedisStore({
          client: app.get("redisClient"),
          prefix: "oauth:",
        }),
        secret: app.get("sessionSecret"),
        resave: false,
        saveUninitialized: true,
        name: "oauth.sid",
      }),
    })
  );
};

class ApiKeyStrategy extends AuthenticationBaseStrategy {
  async authenticate(authentication) {
    const { token } = authentication;

    const config = this.authentication.configuration[this.name];

    const match = config.allowedKeys.includes(token);
    if (!match) throw new NotAuthenticated("Incorrect API Key");

    return {
      apiKey: true,
    };
  }
}
