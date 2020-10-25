module.exports = function (app) {
  function sendEmail(email) {
    return app
      .service("emails")
      .create(email)
      .catch((err) => {
        console.error("Error sending email", err);
      });
  }

  return async function (type, user, notifierOptions) {
    const client = app.get("mongodbClient");
    const collection = client
      .db(app.get("mongoDatabase"))
      .collection(app.get("blacklistCollection"));
    await findOne(collection, { email: user.email }).then((data) => {
      if (data) {
        return;
      }

      let email, link;
      switch (type) {
        case "resendVerifySignup":
          link = `https://sso.angelthump.com/user/verify/${user.verifyToken}`;
          email = {
            from: "noreply@angelthump.com",
            to: user.email,
            subject: "Verify your email",
            html: `Thank you for signing up ${user.display_name}! <br><br> <b>${user.verifyShortToken}</b> <br><br> Enter this code to verify your email 
                            or by clicking the link below!<br><br>${link}<br><br>
                            If the link does not load, please copy and paste the link into the address bar of your browser.`,
          };
          return sendEmail(email);
          /*case 'verifySignup':
            email = {
                    from: "noreply@angelthump.com",
                    to: user.email,
                    subject: 'Thank you, your email has been verified',
                    html: 'Your email has been verified. You have access to all of the site\'s functionality now!'
                }
            return sendEmail(email)*/
        case "sendResetPwd":
          link = `https://sso.angelthump.com/user/reset/password/${user.resetToken}`;
          email = {
            from: "noreply@angelthump.com",
            to: user.email,
            subject: "Reset Password",
            html: `Hi, ${user.display_name} <br><br> To reset your password, please click the link below. <br><br>${link}<br><br> Please ignore this email if you did not request a password change!`,
          };
          return sendEmail(email);
        /*
          case 'resetPwd':
              email = {
                  from: "noreply@angelthump.com",
                  to: user.email,
                  subject: 'Your password has changed',
                  html: `Hi, ${user.display_name} <br><br> Your password was just reset.`
              }
          return sendEmail(email)
          case 'passwordChange':
              email = {
                      from: "noreply@angelthump.com",
                      to: user.email,
                      subject: 'Your password was changed',
                      html: `Hi, ${user.display_name} <br><br> Your password was just reset`
                  }
              return sendEmail(email)*/
        case "identityChange":
          link = `https://sso.angelthump.com/user/change/email/${user.verifyToken}`;
          email = {
            from: "noreply@angelthump.com",
            to: user.email,
            subject: "Did you change your email? Please verify the changes!",
            html: `Hi, ${user.display_name} <br><br> If you requested to change your email, please click the link below. <br><br> ${link} <br><br> Please ignore this email if you did not request to change your email and change your password to a stronger one!`,
          };
          return sendEmail(email);
        default:
          break;
      }
    });
  };
};

function findOne(collection, opt) {
  return new Promise(function (resolve, reject) {
    collection.findOne(opt, function (err, doc) {
      if (err) {
        reject(err);
      } else {
        resolve(doc);
      }
    });
  });
}
