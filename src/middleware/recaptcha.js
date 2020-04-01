const request = require('request');
const requestIP = require('request-ip');

module.exports.verify = function(app) {
    return function(req, res, next) {
        const recaptchaResponse = req.body['g-recaptcha-response'];
        if(recaptchaResponse === undefined || recaptchaResponse === '' || recaptchaResponse === null) {
            req.recaptchaResponse = null;
            next();
        } else {
            const secretKey = app.get('recaptchaSecret');
            const ip = requestIP.getClientIp(req);
            const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaResponse}&remoteip=${ip}`;
            request(verificationUrl,function(error,response,body) {
                body = JSON.parse(body);
                req.recaptchaResponse = body.success;
                next();
            });
        }
    }
}