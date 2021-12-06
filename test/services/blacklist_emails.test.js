const assert = require('assert');
const app = require('../../src/app');

describe('\'blacklist_emails\' service', () => {
  it('registered the service', () => {
    const service = app.service('blacklist-emails');

    assert.ok(service, 'Registered the service');
  });
});
