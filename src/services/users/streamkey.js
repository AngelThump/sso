'use strict';

// We need this to create the MD5 hash
const crypto = require('crypto');

// Returns a long 'random' string to be used for a streamkey
const keyGen = email => {
  const seed = `${crypto.randomBytes(8).toString('hex')}${email}`;
  const key = crypto.createHash('sha256').update(seed).digest('hex');

  return key;
};

//create stream key when user registers
module.exports.create = function() {
  return function(hook) {
    hook.data = Object.assign({}, hook.data, {
      stream_key: keyGen(hook.data.email)
    });
  };
};

//reset on password change
module.exports.considerReset = function() {
  return function(hook) {
    if (typeof hook.data.password !== "undefined") {
      hook.data = Object.assign({}, hook.data, {
        stream_key: keyGen(hook.data.email)
      });
    }
  };
};

//reset when user requests it
module.exports.reset = function() {
  return function(hook) {
    hook.data = Object.assign({}, hook.data, {
      stream_key: keyGen(hook.data.email)
    });
  };
};