'use strict';

// We need this to create the MD5 hash
const crypto = require('crypto');

// Returns a long 'random' string to be used for a streamkey
const keyGen = email => {
  const seed = `${Math.random().toString()}${email}`;
  const key = crypto.createHash('sha256').update(seed).digest('hex');

  return key;
};

module.exports.create = function() {
  return function(hook) {
    // Assign the new data with the streamkey
    hook.data = Object.assign({}, hook.data, {
      streamkey: keyGen(hook.data.email)
    });
  };
};

module.exports.considerReset = function() {
  return function(hook) {
    // reset if the user assigned their streamkey to 0
    if (hook.data.streamkey === 0) {
      // Assign the new data with the streamkey
      hook.data = Object.assign({}, hook.data, {
        streamkey: keyGen(hook.data.email)
      });
    }
  };
};