module.exports = function(app) {
    return function(req, res, next) {
      const authManagement = app.service('authManagement');
      const hash = req.params.hash;
      const type = req.params.type;
      if(type == 'verify') {
        authManagement.create({ action: 'verifySignupLong',
          value: hash,
        }).then(x => {
          res.render('success.ejs', {message: "Email verified!"});
        }).catch(function(error){
          res.render('errors.ejs', {code: error.code, message: error.message});
        });
      } else if (type == 'reset') {
        res.render('reset_password.ejs', {hash: hash});
      } else if (type == 'verifyChanges') {
        authManagement.create({ action: 'verifySignupLong',
          value: hash,
        }).then(()=>{
          res.render('success.ejs', {message: "Email changed!"});
        }).catch(function(error){
          res.render('errors.ejs', {code: error.code, message: error.message});
        });
      }
    };
  };
  
  
  module.exports.resend = function(app) {
    return function(req, res, next) {
      if(req.recaptchaResponse) {
        app.service('users').find({
          query: { email: req.body.email }
        }).then((users) => {
          if (users.total > 0) {
            if(!users.data[0].isVerified) {
              const authManagement = app.service('authManagement');
              authManagement.create({ action: 'resendVerifySignup',
                  value: {email: req.body.email},
                }).then(x => {
                res.render('success.ejs', {message: "Email sent!"});
              }).catch(function(error){
                res.render('errors.ejs', {code: error.code, message: error.message});
              });
            } else {
              res.render('errors.ejs', {code: 400, message: 'user already verified..'});
            }
          } else {
            res.render('errors.ejs', {code: 404, message: 'no user found'});
          }
        })
      } else {
        res.render('errors.ejs', {code: 403, message: 'failed captcha'});
      }
    };
  };
  
  module.exports.passwordChange = function(app) {
    return function(req, res, next) {
      const authManagement = app.service('authManagement');
        authManagement.create({ action: 'resetPwdLong',
          value: {password: req.body.password, token: req.body.hash},
        }).then(x => {
        res.render('success.ejs', {message: "Password has been changed!"});
      }).catch(function(error){
        res.render('errors.ejs', {code: error.code, message: error.message});
      });;
    };
  };
  
  module.exports.emailPasswordReset = function(app) {
    return  function(req, res, next) {
      if(req.recaptchaResponse) {
        app.service('users').find({
          query: { email: req.body.email }
        }).then((users) => {
          if (users.total > 0) {
            const authManagement = app.service('authManagement');
            authManagement.create({ action: 'sendResetPwd',
                value: {email: req.body.email},
              }).then(x => {
              res.render('success.ejs', {message: "Email sent!"});
            }).catch(function(error){
              res.render('errors.ejs', {code: error.code, message: error.message});
            });
          } else {
            res.render('errors.ejs', {code: 404, message: 'no user found'});
          }
        })
      } else {
        res.render('errors.ejs', {code: 403, message: 'failed captcha'});
      }
    };
  };
  
  module.exports.passwordReset = function(app) {
    return function(req, res, next) {
      const authManagement = app.service('authManagement');
        authManagement.create({ action: 'passwordChange',
          value: {user: {email: req.body.email}, oldPassword: req.body.password, password: req.body.newPassword},
        }).then(x => {
        res.render('success.ejs', {message: "Password has been changed!"});
      }).catch(function(error){
        res.render('errors.ejs', {code: error.code, message: error.message});
      });;
    };
  };
  
  module.exports.emailChange = function(app) {
    return function(req, res, next) {
      const authManagement = app.service('authManagement');
      app.service('users').find({
        query: { email: req.body.email }
      }).then(users => {
        if(users.total > 0) {
          app.service('users').find({
            query: { email: req.body.newEmail }
          }).then(users => {
            if(users.total > 0) {
              res.render('errors.ejs', {code: 404, message: 'new email already exists'});
            } else {
              authManagement.create({ action: 'identityChange',
                value: {user: {email: req.body.email}, password: req.body.password, changes: {email: req.body.newEmail} },
              }).then(x => {
                res.render('success.ejs', {message: "Email sent to be confirmed!"});
              }).catch(function(e){
                res.render('errors.ejs', {code: e.code, message: e.message});
              });
            }
          }).catch(e => {
            res.render('errors.ejs', {code: e.code, message: e.message});
          });
        } else {
          res.render('errors.ejs', {code: 404, message: 'no user found'});
        }
      }).catch(e => {
        res.render('errors.ejs', {code: e.code, message: e.message});
      });
    };
  };