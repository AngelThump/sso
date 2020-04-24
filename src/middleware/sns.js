const MessageValidator = require('sns-validator');
const validator = new MessageValidator();

module.exports = function(app) {
    return function(req, res, next) {
        const client = app.get('mongodbClient');
        const collection = client.db(app.get('mongoDatabase')).collection(app.get('blacklistCollection'));

        validator.validate(req.body, async (err, message) => {
            if(err) {
                console.error(err);
                return res.status(400).send('couldn\'t validate the message');
            }

            if (message['Type'] === 'Notification') {
                const json = JSON.parse(message['Message']);
                const notificationType = json.notificationType;
                if(notificationType === 'Bounce') {
                    const bounceObject = json.bounce;
                    if(bounceObject.bounceType === "Permanent") {
                        //bounced email
                        const bounceRecipient = bounceObject.bouncedRecipients[0].emailAddress;
                        await findOne(collection, {email: bounceRecipient})
                        .then((data) => {
                            if(data) {
                                return;
                            }

                            collection.insertOne({email: bounceRecipient}, function(err, data) {
                                if(err) return console.error(err);
                                console.log('Inserted', bounceRecipient + " into blacklisted email database");
                            });
                        })
                    }
                } else if (notificationType === 'Complaint') {
                    const complaintObject = json.complaint;
                    console.log(complaintObject);
                }
            }
            
            if (message['Type'] === 'SubscriptionConfirmation') {
                console.log(`confirmation message: ${message['SubscribeURL']}`);
            }
            res.status(200).send('ok');
        })
    };
};

function findOne(collection, opt) {
    return new Promise(function(resolve, reject) {
        collection.findOne(opt, function(err, doc) {
        if (err) {
            reject(err)
        } else {
            resolve(doc)
        }
        })
    })
}