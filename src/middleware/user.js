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