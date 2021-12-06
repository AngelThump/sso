module.exports.signup = function (app) {
  return function (req, res, next) {
    if (!req.recaptchaResponse) {
      return res.json({
        error: true,
        errorMsg: "failed captcha",
      });
    }

    if (!req.body.username) {
      return res.json({
        error: true,
        errorMsg: "no username",
      });
    }

    if (!req.body.password) {
      return res.json({
        error: true,
        errorMsg: "no password",
      });
    }

    if (!req.body.email) {
      return res.json({
        error: true,
        errorMsg: "no email",
      });
    }

    app
      .service("users")
      .create({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        display_name: req.body.username,
      })
      .then((user) => {
        return res.json({
          error: false,
          user: user,
        });
      })
      .catch((error) => {
        return res.json({
          error: true,
          errorMsg: error.errors[0].message,
        });
      });
  };
};
