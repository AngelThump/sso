const NeDB = require('nedb');
module.exports = function(app) {
    function getLink(type, hash) {
      const host = app.get('host');
      let protocal = 'https'
      protocal += "://"
      return `${protocal}${host}/management/${type}/${hash}`
    }

    function sendEmail(email) {
        return app.service('emails')
        .create(email)
        .catch(err => {
            console.error('Error sending email', err)
        })
    }

    return {
        notifier: function(type, user, notifierOptions) {
            const datastore = new NeDB({
                filename: '../../nedb/blacklist-emails.db',
                autoload: true
            });

            findOne(datastore, {email: user.email}).then(function(doc) {
                if(doc == null) {
                    //console.log(`-- Preparing email for ${user.email} - ${type}`)
                    let hashLink, email;
                    switch (type) {
                        case 'resendVerifySignup':
                            hashLink = getLink('verify', user.verifyToken)
                            email = {
                                    from: "noreply@angelthump.com",
                                    to: user.email,
                                    subject: 'Verify your email',
                                    html: 'Thank you for signing up. Please verify your email by clicking the link below!' + '<br><br>' + hashLink + '<br><br>'
                                    + 'If the link does not load, please copy and paste the link into the address bar of your browser.'
                                }
                            return sendEmail(email)
                            break
                        case 'verifySignup':
                            email = {
                                    from: "noreply@angelthump.com",
                                    to: user.email,
                                    subject: 'Thank you, your email has been verified',
                                    html: 'Your email has been verified. You have access to all of the site\'s functionality now!'
                                }
                            return sendEmail(email)
                            break
                        case 'sendResetPwd':
                            hashLink = getLink('reset', user.resetToken)
                            email = {
                                    from: "noreply@angelthump.com",
                                    to: user.email,
                                    subject: 'Reset Password',
                                    html: 'Hi, ' + user.username + '<br><br>' + 'To reset your password, please click the link below.' + '<br><br>' + hashLink + '<br><br>' 
                                    + 'Please ignore this email if you did not request a password change.'
                                }
                            return sendEmail(email)
                            break
                        case 'resetPwd':
                            email = {
                                    from: "noreply@angelthump.com",
                                    to: user.email,
                                    subject: 'Your password has changed',
                                    html: 'Hi, ' + user.username + '<br><br>' + 'Your password was just reset.'
                                }
                            return sendEmail(email)
                            break
                        case 'passwordChange':
                            email = {
                                    from: "noreply@angelthump.com",
                                    to: user.email,
                                    subject: 'Your password was changed',
                                    html: 'Hi, ' + user.username + '<br><br>' + 'Your password was just reset.'
                                }
                            return sendEmail(email)
                            break
                        case 'identityChange':
                            hashLink = getLink('verifyChanges', user.verifyToken)
                            email = {
                                    from: "noreply@angelthump.com",
                                    to: user.email,
                                    subject: 'Your email was changed. Please verify the changes',
                                    html: 'Hi, ' + user.username + '<br><br>' + 'To change your email, please click the link below.' + '<br><br>' + hashLink + '<br><br>' 
                                    + 'Please ignore this email if you did not request to change your email'
                                }
                            return sendEmail(email)
                            break
                        default:
                            break
                    }
                }
            })
        }
    }
}

function findOne(db, opt) {
    return new Promise(function(resolve, reject) {
        db.findOne(opt, function(err, doc) {
        if (err) {
            reject(err)
        } else {
            resolve(doc)
        }
        })
    })
}