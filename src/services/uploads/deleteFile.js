const AWS = require("@aws-sdk/client-s3");

module.exports = function () {
  return async function (context) {
    const app = context.app;
    const s3 = new AWS.S3({
      forcePathStyle: false,
      endpoint: "https://nyc3.digitaloceanspaces.com",
      credentials: {
        accessKeyId: app.get("doSpacesAccessKey"),
        secretAccessKey: app.get("doSpacesSecretKey"),
      },
    });

    const path = context.path;
    if (path === "uploads/profile") {
      const url = context.params.user.profile_logo_url;
      if (!url) {
        return;
      }
      const id = url.substring(url.lastIndexOf("/") + 1, url.length);

      const params = { Bucket: "images-angelthump/profile-logos", Key: id };
      s3.deleteObject(params, function (err, data) {
        if (err) return console.log(err, err.stack);
      });
    } else if (path === "uploads/offline") {
      const url = context.params.user.offline_banner_url;
      if (!url) {
        return;
      }
      const id = url.substring(url.lastIndexOf("/") + 1, url.length);
      const params = { Bucket: "images-angelthump/offline-banners", Key: id };
      s3.deleteObject(params, function (err, data) {
        if (err) return console.log(err, err.stack);
      });
    }

    context.params.user.profile;

    return context;
  };
};
