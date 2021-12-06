const MessageValidator = require("sns-validator");
const validator = new MessageValidator();
const axios = require("axios");

module.exports = function (app) {
  return function (req, res, next) {
    validator.validate(req.body, async function (err, message) {
      if (err) return res.status(400).send("couldn't validate the message");

      if (message["Type"] === "SubscriptionConfirmation") axios.get(message["SubscribeURL"]);

      if (message["Type"] !== "Notification") return res.status(200).end();

      const json = JSON.parse(message["Message"]);
      switch (json.notificationType) {
        case "Bounce": {
          const bounceObject = json.bounce;
          if (bounceObject.bounceType === "Permanent") {
            const bounceRecipient = bounceObject.bouncedRecipients[0].emailAddress;
            const blacklistedEmail = await app
              .service("blacklist-emails")
              .get(bounceRecipient)
              .catch(() => false);
            if (!blacklistedEmail)
              app
                .service("blacklist-emails")
                .create({
                  email: bounceRecipient,
                })
                .then(() => {
                  console.info(`Inserted ${bounceRecipient} to blacklist`);
                });
          }
          break;
        }
        case "Complaint": {
          const complaintObject = json.complaint;
          console.error(complaintObject);
          break;
        }
      }
    });
    res.status(200).send("ok");
  };
};
