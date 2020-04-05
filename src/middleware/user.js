module.exports.sendResetPassword = function(app) {
    return function(req, res, next) {
        if(!req.recaptchaResponse) {
            return res.json({
                error: true,
                errorMsg: "failed captcha"
            })
        }

        if(!req.body.email) {
            return res.json({
                error: true,
                errorMsg: "no email"
            })
        }

        const authManagement = app.service('authManagement');

        authManagement.create({ 
            action: 'sendResetPwd',
            value: {email: req.body.email},
        }).then(() => {
            return res.json({
                error: false,
                errorMsg: ""
            })
        }).catch(e => {
            console.error(e.message);
            return res.json({
                error: true,
                errorMsg: "something went wrong with auth management service."
            })
        });
    };
};

module.exports.getUsername = function(app) {
    return async function(req, res, next) {
        if(!req.recaptchaResponse) {
            return res.json({
                error: true,
                errorMsg: "failed captcha"
            })
        }

        if(!req.body.email) {
            return res.json({
                error: true,
                errorMsg: "no email"
            })
        }

        const user = await app.service('users').find({email: req.body.email})
        .then(users => {
            return users.data[0];
        }).catch((e) => {
            console.error(e);
            return res.json({
                error: true,
                errorMsg: "something went wrong with users service."
            })
        })

        if(user) {
            await app.service('emails')
            .create({
                from: "noreply@angelthump.com",
                to: user.email,
                subject: 'Here is your AngelThump Username!',
                html: `Hi, here is the username you requested: ${user.username}`
            })
            .catch(e => {
                console.error(e.message);
                return res.json({
                    error: true,
                    errorMsg: "something went wrong with email service."
                })
            })

            return res.json({
                error: false,
                errorMsg: ""
            })
        } else {
            return res.json({
                error: true,
                errorMsg: "user does not exist"
            })
        }
    };
};

module.exports.resetPassword = function(app) {
    return function(req, res, next) {
        const authManagement = app.service('authManagement');
        if(!req.body.password) {
            return res.json({
                error: true,
                errorMsg: "no password"
            })
        }

        if(!req.body.hash) {
            return res.json({
                error: true,
                errorMsg: "no hash"
            })
        }

        authManagement.create({ 
            action: 'resetPwdLong',
            value: {password: req.body.password, 
            token: req.body.hash}
        }).then(() => {
            res.redirect('https://angelthump.com');
        }).catch(e => {
            console.error(e.message);
            return res.json({
                error: true,
                errorMsg: "something went wrong with auth management service"
            })
        });
    };
};

module.exports.changePassword = function(app) {
    return function(req, res, next) {
        if(!req.body.password) {
            return res.json({
                error: true,
                errorMsg: "no password"
            })
        }

        if(!req.body.email) {
            return res.json({
                error: true,
                errorMsg: "no email"
            })
        }

        if(!req.body.newPassword) {
            return res.json({
                error: true,
                errorMsg: "no new password"
            })
        }

        const authManagement = app.service('authManagement');
        
        authManagement.create({
            action: 'passwordChange',
            value: {
                user: {
                    email: req.body.email
                }, 
                oldPassword: req.body.password,
                password: req.body.newPassword
            }
        }).then(() => {
            return res.json({
                error: false,
                errorMsg: ""
            })
        }).catch(e => {
            console.error(e.message);
            return res.json({
                error: true,
                errorMsg: "something went wrong with auth management"
            })
        });
    };
};


module.exports.emailChange = function(app) {
    return function(req, res, next) {

        if(!req.body.email) {
            return res.json({
                error: true,
                errorMsg: "no email"
            })
        }

        if(!req.body.password) {
            return res.json({
                error: true,
                errorMsg: "no password"
            })
        }

        if(!req.body.newEmail) {
            return res.json({
                error: true,
                errorMsg: "no new email"
            })
        }

        const authManagement = app.service('authManagement');

        authManagement.create({ 
            action: 'identityChange',
            value: {
                user: {
                    email: req.body.email
                },
                password: req.body.password,
                changes: {
                    email: req.body.newEmail
                }
            }
        }).then(() => {
            return res.json({
                error: false,
                errorMsg: ""
            })
        }).catch(e =>{
            console.error(e.message);
            return res.json({
                error: true,
                errorMsg: "something went wrong with auth management"
            })
        });
    };
};

module.exports.verifyEmailChange = function(app) {
    return function(req, res, next) {

        if(!req.params.hash) {
            return res.json({
                error: true,
                errorMsg: "no hash"
            })
        }

        const authManagement = app.service('authManagement');

        authManagement.create({ 
            action: 'verifySignupLong',
            value: req.params.hash
        }).then(() => {
            return res.render('success.ejs', {message: "Email changed!"});
        }).catch(e =>{
            console.error(e.message);
            return res.json({
                error: true,
                errorMsg: "something went wrong with auth management"
            })
        });
    };
};

module.exports.verify = function(app) {
    return function(req, res, next) {

        if(!req.params.hash) {
            return res.json({
                error: true,
                errorMsg: "no hash"
            })
        }

        const authManagement = app.service('authManagement');

        authManagement.create({ 
            action: 'verifySignupLong',
            value: req.params.hash
        }).then(() => {
            return res.render('success.ejs', {message: "Email verified!"});
        }).catch(e =>{
            console.error(e.message);
            return res.json({
                error: true,
                errorMsg: "something went wrong with auth management"
            })
        });
    };
};

module.exports.changeDisplayName = function(app) {
    return function(req, res, next) {

        if(!req.body.display_name) {
            return res.json({
                error: true,
                errorMsg: "no display name"
            })
        }

        const user = req.user;

        if(user.display_name === req.body.display_name) {
            return res.json({
                error: true,
                errorMsg: "same name"
            })
        }

        if(user.username !== req.body.display_name.toLowerCase()) {
            return res.json({
                error: true,
                errorMsg: "Cannot change display name that differs from your username. You can only change the capitalization"
            })
        }

        const users = app.service('users');

        users.patch(user.id,{
            display_name: req.body.display_name
        }).then(() => {
            return res.json({
                error: false,
                errorMsg: ""
            })
        }).catch(e => {
            console.error(e);
            return res.json({
                error: true,
                errorMsg: "something went wrong with users service"
            })
        })
    };
};

const bcrypt = require('bcryptjs');


module.exports.verifyPassword = function(app) {
    return async function(req, res, next) {

        if(!req.body.password) {
            return res.json({
                error: true,
                errorMsg: "no password"
            })
        }

        const userPassword = 
        await app.service('users').get(req.user.id)
        .then(user => {
            return user.password
        }).catch(e => {
            console.error(e);
        })

        const result = 
        await bcrypt.compare(req.body.password, userPassword)
        .catch(e => {
            console.error(e);
        });

        if(result) {
            return res.json({
                error: false,
                errorMsg: ""
            })
        } else {
            return res.json({
                error: true,
                errorMsg: "passwords do not match"
            })
        }
    };
};

module.exports.changeUsername = function(app) {
    return async function(req, res, next) {

        if(!req.body.username) {
            return res.json({
                error: true,
                errorMsg: "no username"
            })
        }

        const users = app.service('users');

        users.patch(req.user.id, {
            username: req.body.username,
            display_name: req.body.username
        }).then(()=>{
            return res.json({
                error: false,
                errorMsg: ""
            })
        }).catch(e=>{
            console.error(e)
            return res.json({
                error: true,
                errorMsg: "something went wrong with users service"
            })
        })
    };
};

const AWS = require('aws-sdk');

module.exports.deleteProfileLogo = function(app) {
    return async function(req, res, next) {
        const users = app.service('users');

        const profile_logo_url = req.user.profile_logo_url;
        
        if(!profile_logo_url) {
            return res.json({
                error: true,
                errorMsg: "has default photo, cannot delete"
            })
        }

        const id = profile_logo_url.substring(profile_logo_url.lastIndexOf('/')+1, profile_logo_url.length);

        const spacesEndpoint = new AWS.Endpoint('nyc3.digitaloceanspaces.com');
        const s3 = new AWS.S3({
            accessKeyId: app.get('doSpacesAccessKey'),
            secretAccessKey: app.get('doSpacesSecretKey'),
            endpoint: spacesEndpoint
        });

        const params = {Bucket: 'images-angelthump/profile-logos', Key: id};
        s3.deleteObject(params, function(err, data) {
            if (err) return console.error(err, err.stack);
        });

        users.patch(req.user.id, {
            profile_logo_url: null
        }).then(()=>{
            return res.json({
                error: false,
                errorMsg: ""
            })
        }).catch(e=>{
            console.error(e)
            return res.json({
                error: true,
                errorMsg: "something went wrong with users service"
            })
        })
    };
};

module.exports.deleteOfflineBanner = function(app) {
    return async function(req, res, next) {
        const users = app.service('users');

        const offline_banner_url = req.user.offline_banner_url;
        
        if(!offline_banner_url) {
            return res.json({
                error: true,
                errorMsg: "has default photo, cannot delete"
            })
        }

        const id = offline_banner_url.substring(offline_banner_url.lastIndexOf('/')+1, offline_banner_url.length);

        const spacesEndpoint = new AWS.Endpoint('nyc3.digitaloceanspaces.com');
        const s3 = new AWS.S3({
            accessKeyId: app.get('doSpacesAccessKey'),
            secretAccessKey: app.get('doSpacesSecretKey'),
            endpoint: spacesEndpoint
        });

        const params = {Bucket: 'images-angelthump/offline-banners', Key: id};
        s3.deleteObject(params, function(err, data) {
            if (err) return console.error(err, err.stack);
        });

        users.patch(req.user.id, {
            offline_banner_url: null
        }).then(()=>{
            return res.json({
                error: false,
                errorMsg: ""
            })
        }).catch(e=>{
            console.error(e)
            return res.json({
                error: true,
                errorMsg: "something went wrong with users service"
            })
        })
    };
};

const crypto = require('crypto');

const keyGen = email => {
    const seed = `${crypto.randomBytes(8).toString('hex')}${email}`;
    const key = crypto.createHash('sha256').update(seed).digest('hex');

    return key;
};

module.exports.resetStreamKey = function(app) {
    return async function(req, res, next) {
        const user = req.user;
        const new_stream_key = keyGen(user.email);
        const users = app.service('users');

        users.patch(user.id, {
            stream_key: new_stream_key
        }).then(()=>{
            return res.json({
                error: false,
                errorMsg: ""
            })
        }).catch(e=>{
            console.error(e)
            return res.json({
                error: true,
                errorMsg: "something went wrong with users service"
            })
        })
    };
};


module.exports.changeNSFW = function(app) {
    return async function(req, res, next) {

        if(typeof req.body.nsfw === 'undefined') {
            return res.json({
                error: true,
                errorMsg: "no nsfw in body"
            })
        }

        const user = req.user;
        const users = app.service('users');

        users.patch(user.id, {
            nsfw: req.body.nsfw
        }).then(()=>{
            return res.json({
                error: false,
                errorMsg: ""
            })
        }).catch(e=>{
            console.error(e)
            return res.json({
                error: true,
                errorMsg: "something went wrong with users service"
            })
        })
    };
};