const { authenticate } = require('@feathersjs/authentication').hooks;
const { setField } = require('feathers-authentication-hooks');
const { hashPassword, protect } = require('@feathersjs/authentication-local').hooks;
const { discard , iff, isProvider, disallow } = require('feathers-hooks-common');
const verifyHooks = require('authentication-local-management-at').hooks;
const accountService = require('../auth-management/notifier');
const streamkey = require('./streamkey');
const checkPermissions = require('feathers-permissions');

const restrictToOwner = [
  setField({
    from: 'params.user.id',
    as: 'params.query.id'
  })
];

module.exports = {
  before: {
    all: [],
    find: [
      authenticate('jwt'),
      checkPermissions({
        roles: ['admin'],
        field: 'type',
        error: false
      }),
      iff(context => !context.params.permitted,
        ...restrictToOwner
      )
    ],
    get: [
      authenticate('jwt'), 
      checkPermissions({
        roles: ['admin'],
        field: 'type',
        error: false
      }),
      iff(context => !context.params.permitted,
        ...restrictToOwner
      )
    ],
    create: [ disallow('external'), hashPassword('password'), streamkey.create(), verifyHooks.addVerification()],
    update: [ disallow()],
    patch: [ disallow('external'), streamkey.considerReset() ],
    remove: [ disallow()]
  },

  after: {
    all: [ 
      // Make sure the password field is never sent to the client
      // Always must be the last hook
      protect('password')
    ],
    find: [
      iff(isProvider('external'),
        discard('bans', 'patreon.access_token', 'patreon.refresh_token', 'twitch.access_token', 'twitch.refresh_token', 'verifyToken', 'verifyShortToken', 'resetToken', 'resetShortToken', 'verifyChanges', 'resetExpired', 'verifyExpires')
      )
    ],
    get: [
      iff(isProvider('external'),
        discard('bans', 'patreon.access_token', 'patreon.refresh_token', 'twitch.access_token', 'twitch.refresh_token', 'verifyToken', 'verifyShortToken', 'resetToken', 'resetShortToken', 'verifyChanges', 'resetExpired', 'verifyExpires')
      )
    ],
    create: [
      async context => {
        await accountService(context.app).notifier('resendVerifySignup', context.result);
      },
      verifyHooks.removeVerification()
    ],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [
      protect('password'),
      /*debugging
      context => {
        console.error(`Error in '${context.path}' service method '${context.method}'`, context.error.stack);
      }*/
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
