const recaptcha = require('./recaptcha');
const signup = require('./signup');
const sns = require('./sns');
const client = require('redis').createClient();
const { authenticate } = require('@feathersjs/express');
const validation = require('./validation');
const user = require('./user');

module.exports = function (app) {
  const limiter = require('express-limiter')(app, client)
  limiter({
    path: '*',
    method: 'post',
    lookup: 'headers.x-forwarded-for',
    total: 5,
    expire: 1000 * 5,
    onRateLimited: (req, res, next) => {
      next({ message: 'Rate limit exceeded', code: 429 })
    }
  });

  app.post('/v1/sns', sns(app))

  app.get('/user/reset/password/:hash', (req,res,next) => res.render('reset_password.ejs', {hash: req.params.hash}));

  app.get('/user/verify/:hash', user.verify(app));
  app.post('/v1/user/reset-password', user.resetPassword(app));
  app.post('/v1/user/password', [recaptcha.verify(app),user.sendResetPassword(app)]);
  app.post('/v1/user/change/password', user.changePassword(app));
  app.post('/v1/user/change/email', user.emailChange(app));
  app.get('/user/change/email/:hash', user.verifyEmailChange(app));
  app.post('/v1/user/username', [recaptcha.verify(app),user.getUsername(app)]);

  app.post('/v1/user/verify/password', authenticate('jwt'), user.verifyPassword(app))
  app.post('/v1/user/verify/patreon', authenticate('jwt'), user.verifyPatreon(app))
  app.delete('/v1/user/profile-logo', authenticate('jwt'), user.deleteProfileLogo(app))
  app.delete('/v1/user/offline-banner', authenticate('jwt'), user.deleteOfflineBanner(app))
  app.delete('/v1/user/patreon', authenticate('jwt'), user.deletePatreon(app))
  app.delete('/v1/user/twitch', authenticate('jwt'), user.deleteTwitch(app))
  app.put('/v1/user/stream-key', authenticate('jwt'), user.resetStreamKey(app))
  app.put('/v1/user/display-name', authenticate('jwt'), user.changeDisplayName(app))
  app.put('/v1/user/username', authenticate('jwt'), user.changeUsername(app))
  app.put('/v1/user/nsfw', authenticate('jwt'), user.changeNSFW(app))
  app.put('/v1/user/email', authenticate('jwt'), user.changeEmail(app))

  app.post('/v1/signup', [recaptcha.verify(app), signup.signup(app)]);


  app.post('/v1/validation/username', validation.username(app));
  app.post('/v1/validation/email', validation.email(app));
};
