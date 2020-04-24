// Initializes the `uploads` service on path `/uploads`
const { Uploads } = require('./uploads.class');
const hooks = require('./uploads.hooks');
const BlobService = require('feathers-blob');
const multer = require('multer');
const store = require('s3-blob-store');
const AWS = require('aws-sdk');

module.exports = function (app) {
  const multipartMiddleware = multer();

  const spacesEndpoint = new AWS.Endpoint('nyc3.digitaloceanspaces.com');
  const s3 = new AWS.S3({
    accessKeyId: app.get('doSpacesAccessKey'),
    secretAccessKey: app.get('doSpacesSecretKey'),
    endpoint: spacesEndpoint
  });

  const offlineBlobStore = store({
    client: s3,
    bucket: 'images-angelthump/offline-banners'
  });

  app.use('/uploads/offline-banners', 
    (new Uploads(null, app),
    multipartMiddleware.single('uri'),
    (req,res,next) => {
      req.feathers.file = req.file;
      next();
    },
    BlobService({Model: offlineBlobStore})
  ));

  app.service('uploads/offline-banners').hooks(hooks);

  const profilePicBlobStore = store({
    client: s3,
    bucket: 'images-angelthump/profile-logos'
  });

  app.use('/uploads/profile-logos',
      (new Uploads(null, app),
      multipartMiddleware.single('uri'),
      (req,res,next) => {
          req.feathers.file = req.file;
          next();
      },
      BlobService({Model: profilePicBlobStore})
  ));

  app.service('uploads/profile-logos').hooks(hooks);
};
