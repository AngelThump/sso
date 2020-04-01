const { authenticate } = require('@feathersjs/authentication').hooks;
const { setField } = require('feathers-authentication-hooks');
const { hashPassword, protect } = require('@feathersjs/authentication-local').hooks;
const { discard , iff, isProvider, preventChanges, disallow } = require('feathers-hooks-common');
const verifyHooks = require('authentication-local-management-at').hooks;
const accountService = require('../auth-management/notifier');
const streamkey = require('./streamkey');
const checkPermissions = require('feathers-permissions');

const restrictToOwner = [
  setField({
    from: 'params.user._id',
    as: 'params.query._id'
  })
];

module.exports = {
  before: {
    all: [],
    find: [ authenticate('jwt'),
      checkPermissions({
        roles: ['super_admin', 'admin'],
        field: 'roles',
        error: false
      }), ...restrictToOwner
      ],
    get: [ authenticate('jwt'), checkPermissions({
      roles: ['super_admin', 'admin'],
      field: 'roles',
      error: false
    }), ...restrictToOwner],
    create: [ hashPassword('password'), streamkey.create(), verifyHooks.addVerification(), disallow('external')],
    update: [ disallow()],
    patch: [authenticate('jwt'), ...restrictToOwner, streamkey.considerReset(), 
    iff(isProvider('external'),
      preventChanges(true,
        'email',
        'isVerified',
        'verifyToken',
        'verifyShortToken',
        'verifyExpires',
        'verifyChanges',
        'resetToken',
        'resetShortToken',
        'resetExpires',
        ),
        hashPassword('password'),
        authenticate('jwt')
      )],
    remove: [ disallow()]
  },

  after: {
    all: [ 
      // Make sure the password field is never sent to the client
      // Always must be the last hook
      protect('password')
    ],
    //for public api, get rid of all unneeded stuff. keep privacy to internal calls.
    find: [iff(isProvider('external'), discard('verifyToken', 'verifyExpires', 'verifyChanges', 'resetToken', 'resetExpires', 'ingestServer', 'bans', 'ingest'))],
    get: [iff(isProvider('external'), discard('verifyToken', 'verifyExpires', 'verifyChanges', 'resetToken', 'resetExpires', 'ingestServer', 'bans', 'ingest'))],
    create: [
      context => {
        accountService(context.app).notifier('resendVerifySignup', context.result)
      },
      verifyHooks.removeVerification()],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [
      protect('password')
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
