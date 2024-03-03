module.exports.login = (app) => {
  return async (req, res, next) => {
    try {
      const { username, password } = req.body;
      const { accessToken } = await app.service("authentication").create({
        strategy: "local",
        username,
        password,
      });

      if (req.session)
        req.session.authentication = {
          strategy: "jwt",
          accessToken,
        };

      res.status(200).json({ accessToken: accessToken });
    } catch (error) {
      res.status(403).json({ error: true, errorMsg: "Not Authenticated!" });
    }
  };
};

module.exports.logout = (app) => {
  return async (req, res, next) => {
    if (req.session) delete req.session.authentication;
    res.status(200).end();
  };
};

module.exports.setSessionAuthentication = (req, res, next) => {
  req.authentication = req.session.authentication;
  next();
};
