'use strict';
const NeDB = require('nedb');
const path = require('path');
var MessageValidator = require('sns-validator');
var validator = new MessageValidator();

module.exports = function(app) {
    return function(req, res, next) {
        validator.validate(req.body, function (err, message) {
            if(err) {
                return res.status(400).send('couldn\'t validate the message');
            }

            if (message['Type'] === 'Notification') {
                const json = JSON.parse(message['Message']);
                const notificationType = json.notificationType;
                if(notificationType === 'Bounce') {
                    const bounceObject = json.bounce;
                    if(bounceObject.bounceType === "Permanent") {
                        //don't deliver ever again to this email
                        const datastore = new NeDB({
                            filename: path.join(__dirname, '../../nedb/blacklist-emails.db'),
                            autoload: true
                        });
                        const bounceRecipient = bounceObject.bouncedRecipients[0].emailAddress;
                        findOne(datastore, {email: bounceRecipient}).then(function(doc) {
                            if(doc == null) {
                                var emailModel = {email: bounceRecipient};
                                datastore.insert(emailModel, function(err, doc) {  
                                    console.log('Inserted', doc.email + " into blacklisted email database");
                                });
                            }
                        })
                    } else {
                        console.log("help " + bounceObject);
                        res.status(200).send("bad request")
                    }
                } else if (notificationType === 'Complaint') {
                    const complaintObject = json.complaint;
                    console.log(complaintObject);
                }
            }
            /*
            if (message['Type'] === 'SubscriptionConfirmation') {
                console.log('confirmation message');
                https.get(message['SubscribeURL'], function (res) {
                  // You have confirmed your endpoint subscription
                });
            }*/
        })
        res.status(200).send('ok');
    };
};

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