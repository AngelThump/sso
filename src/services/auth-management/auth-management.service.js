const hooks = require('./auth-management.hooks');
const notifier = require('./notifier');
const authManagement = require('feathers-authentication-management');

module.exports = function (app) {

  app.configure(authManagement( {
    skipIsVerifiedCheck: true,  
    notifier: notifier(app)
  }));

  // Get our initialized service so that we can register hooks
  const service = app.service('authManagement');

  service.hooks(hooks);
};