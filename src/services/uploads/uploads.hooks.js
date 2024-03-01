const { authenticate } = require("@feathersjs/authentication").hooks;
const dauria = require("dauria");
const deleteFile = require("./deleteFile");
const saveToDb = require("./saveToDb");

module.exports = {
  before: {
    all: [authenticate("jwt")],
    find: [],
    get: [],
    create: [
      (context) => {
        context.params.s3 = {
          ACL: "public-read",
          CacheControl: "max-age=31536000",
        };
        if (!context.data.uri && context.params.file) {
          const file = context.params.file;
          const uri = dauria.getBase64DataURI(file.buffer, file.mimetype);
          context.data = { uri: uri };
        }
      },
    ],
    update: [],
    patch: [],
    remove: [],
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [deleteFile(), saveToDb()],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [
      (context) => {
        console.error(
          `Error in '${context.path}' service method '${context.method}'`,
          context.error.stack
        );
      },
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};
