const verifyHooks = require('authentication-local-management-at').hooks;

module.exports.considerVerify = function() {
    return function(context) {
        if (typeof context.data.email !== "undefined") {
            verifyHooks.addVerification();
        }
    };
};