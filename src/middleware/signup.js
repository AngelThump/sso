module.exports = function(app) {
  return function(req, res, next) {
    if(req.recaptchaResponse) {
      const body = req.body;
      // Get the user service and `create` a new user
      app.service('users').create({
        username: body.username,
        email: body.email,
        password: body.password
      })
      // Then redirect to the login page
      .then(() => {
        res.redirect('https://angelthump.com/dashboard');
        //res.json(e);
      })
      // On errors, just call our error middleware
      .catch(error => {
        console.error(error);
        res.render('errors.ejs', {code: error.code, message: error.message});
      });
    } else {
      res.render('errors.ejs', {code: 403, message: 'failed captcha'});
    }
  };
};

module.exports.signupv2 = function(app) {
  return function(req, res, next) {
    console.log(req.recaptchaResponse);
    if(!req.recaptchaResponse) {
      return res.json({
        error: true,
        errorMsg: "failed captcha"
      })
    }

    if(!req.body.username) {
      return res.json({
        error: true,
        errorMsg: "no username"
      })
    }

    if(!req.body.password) {
      return res.json({
        error: true,
        errorMsg: "no password"
      })
    }

    if(!req.body.email) {
      return res.json({
        error: true,
        errorMsg: "no email"
      })
    }

    app.service('users').create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
    })
    .then(user => {
      return res.json({
        error: false,
        user: user
      })
    })
    .catch(error => {
      console.error(error);
      return res.json({
        error: true,
        errorMsg: error.message
      })
    });
  };
};