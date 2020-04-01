// eslint-disable-next-line no-unused-vars
const recaptcha = require('./recaptcha');
const signup = require('./signup');
const authManagement = require('./auth-management');
const email = require('./email');
const client = require('redis').createClient();
const validation = require('./validation');

module.exports = function (app) {
  const limiter = require('express-limiter')(app, client)
  limiter({
    path: '*',
    method: 'post',
    lookup: 'headers.x-forwarded-for',
    total: 10,
    expire: 1000 * 5,
    onRateLimited: (req, res, next) => {
      next({ message: 'Rate limit exceeded', code: 429 })
    }
  });

  app.post('/email-notifications', email(app))
  app.post('/resendVerification', [recaptcha.verify(app),authManagement.resend(app)]);
  app.post('/emailPasswordReset', [recaptcha.verify(app),authManagement.emailPasswordReset(app)]);
  app.post('/passwordReset', authManagement.passwordReset(app));
  app.post('/passwordChange', authManagement.passwordChange(app));
  app.post('/emailChange', authManagement.emailChange(app));
  app.get('/management/:type(verify||reset||verifyChanges)/:hash', authManagement(app));

  app.post('/signup', [recaptcha.verify(app), signup(app)]);
  app.post('/v2/signup', [recaptcha.verify(app), signup.signupv2(app)]);


  app.post('/v1/validation/username', validation.username(app));
};
