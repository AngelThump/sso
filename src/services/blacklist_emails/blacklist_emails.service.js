// Initializes the `blacklist_emails` service on path `/blacklist-emails`
const { BlacklistEmails } = require('./blacklist_emails.class');
const createModel = require('../../models/blacklist_emails.model');
const hooks = require('./blacklist_emails.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/blacklist-emails', new BlacklistEmails(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('blacklist-emails');

  service.hooks(hooks);
};
