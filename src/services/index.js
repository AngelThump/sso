const users = require('./users/users.service.js');
const emails = require('./emails/emails.service.js');
const authManagement = require('./auth-management/auth-management.service.js');
const uploads = require('./uploads/uploads.service.js');
const blacklistEmails = require('./blacklist_emails/blacklist_emails.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(users);
  app.configure(emails);
  app.configure(authManagement);
  app.configure(uploads);
  app.configure(blacklistEmails);
};
