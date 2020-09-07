const verifyHooks = require('feathers-authentication-management').hooks;

module.exports.considerVerify = function() {
    return function(context) {
        if (typeof context.data.email !== "undefined") {
            verifyHooks.addVerification();
        }
    };
};