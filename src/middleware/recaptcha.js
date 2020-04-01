const requestIP = require('request-ip');
const axios = require('axios');

module.exports.verify = function(app) {
    return function(req, res, next) {
        const recaptchaResponse = req.body['g-recaptcha-response'];
        if(recaptchaResponse === undefined || recaptchaResponse === '' || recaptchaResponse === null) {
            req.recaptchaResponse = null;
            return next();
        }

        const secretKey = app.get('recaptchaSecret');
        const ip = requestIP.getClientIp(req);
        const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaResponse}&remoteip=${ip}`;
        axios.get(verificationUrl)
        .then(response => {
            req.recaptchaResponse = response.data.success;
            next();
        })
        .catch(e => {
            console.error(e.toJson())
        })
    }
}