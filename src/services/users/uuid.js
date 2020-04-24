'use strict';
const { v4: uuidv4 } = require('uuid');

//create stream key when user registers
module.exports.create = function() {
  return function(context) {
    context.data = Object.assign({}, context.data, {
      id: uuidv4()
    });
  };
};