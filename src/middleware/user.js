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

const axios = require('axios');

const refresh = (app, userPatreonObject) => {
    const patreon = app.get('patreon');
    const CLIENT_ID = patreon.CLIENT_ID;
    const CLIENT_SECRET = patreon.CLIENT_SECRET;

    axios.get('https://www.patreon.com/api/oauth2/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: {
            'grant_type': 'refresh_token',
            'refresh_token': userPatreonObject.refresh_token,
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET,
        }
    }).then(data => {
        let patreonObject = userPatreonObject;
        patreonObject.access_token = data.access_token;
        patreonObject.refresh_token = data.refresh_token;

        app.service('users').patch(user._id, {
            patreon: patreonObject
        }).then(() => {
            verify(app);
        }).catch(e => {
            return console.error(e.message);
        });
    }).catch(e => {
        console.error(e.response.data);
    })
};

module.exports.verifyPatreon = function (app) {
    return async function(req, res, next) {
        const patreon = app.get('patreon');
        const campaignID = patreon.campaignID;
        const user = req.user;

        const userPatreonObject =
        await app.service('users')
        .get(user.id)
        .then(data => {
            return data.patreon
        }).catch(e => {
            console.error(e.message)
        })

        const patronData =
        await axios('https://www.patreon.com/api/oauth2/v2/identity?include=memberships.campaign&fields%5Bmember%5D=full_name,is_follower,email,last_charge_date,last_charge_status,lifetime_support_cents,patron_status,currently_entitled_amount_cents,pledge_relationship_start,will_pay_amount_cents&fields%5Btier%5D=title&fields%5Buser%5D=full_name,hide_pledges', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userPatreonObject.access_token}`,
            }
        }).then(data => {
            if(data.included && typeof data.included[Symbol.iterator] === 'function') {
                for(const included of data.included) {
                    if(included.relationships) {
                        if(campaignID == included.relationships.campaign.data.id) {
                            return included;
                        }
                    }
                }
            }
        }).catch(e => {
            if(e.status === 401) {
                return refresh(app, userPatreonObject.refresh_token);
            }
            console.error(e.response.data);
            return res.json({
                error: true,
                errorMsg: "Something went wrong fetching patreon api"
            })
        });

        if(!patronData) {
            return res.json({error: true, errorMsg: "You are currently not a patron"});
        }

        const amount = patronData.attributes.currently_entitled_amount_cents;
        const last_charged_status = patronData.attributes.last_charge_status.toLowerCase();

        // the amount was less than $5
        if (amount < 500) {
            return res.json({error: true, errorMsg: "Patron status is only allowed at $5 or more"});
            //console.log("debug (amount): " + patronData.attributes);
        }

        /*
        // the user is not an active patron
        if (patron_status !== 'active_patron') {
            return res.json({error: true, errorMsg: "Not an active patron"});
            //console.log("debug (patron_status): " + patronData.attributes);
        }*/

        // the last transaction failed
        if (last_charged_status !== 'paid') {
            return res.json({error: true, errorMsg: "Last patreon payment was declined"});
            //console.log("debug (last_charged_status): " + data.attributes);
        }

        // the user has not verified the email attached to their at account
        if (!user.isVerified) {
            return res.json({error: true, errorMsg: "Email is not verified!"});
        }

        let newTier;

        if(amount >= 500 && amount < 1000) {
            newTier = 1;
        } else if (amount >= 1000 && amount < 5000) {
            newTier = 2
        } else if (amount >= 5000) {
            newTier = 3;
        }

        // the user is already verified but linking patreon should be idempotent
        if (userPatreonObject.isPatron && newTier === userPatreonObject.tier) {
            return res.json({error: true, errorMsg: "You are a patron already!"});
        }

        userPatreonObject.isPatron = true;
        userPatreonObject.tier = newTier;

        app.service('users').patch(user._id, {
            patreon: patreonObject
        }).then(() => {
            return res.json({error: false, errorMsg:"", message: "Updated Patreon Status"});
        }).catch(e => {
            console.error(`db error while saving patron status for ${user._id}`);
            return res.json({error: true, errorMsg:"An error occurred while linking your account!"});
        });
    }
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

module.exports.changeEmail = function(app) {
    return async function(req, res, next) {

        if(!req.body.email) {
            return res.json({
                error: true,
                errorMsg: "no email"
            })
        }

        const users = app.service('users');

        users.patch(req.user.id, {
            email: req.body.email
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

module.exports.deletePatreon = function(app) {
    return async function(req, res, next) {

        const user = req.user;
        const users = app.service('users');

        users.patch(user.id, {
            patreon: null
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

module.exports.deleteTwitch = function(app) {
    return async function(req, res, next) {

        const user = req.user;
        const users = app.service('users');

        users.patch(user.id, {
            twitch: null
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