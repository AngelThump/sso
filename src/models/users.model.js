// users-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');

  validate = require('mongoose-validator');

  const usernameValidator = [
	  validate({
	    validator: 'isLength',
	    arguments: [3, 30],
	    message: 'Name should be between {ARGS[0]} and {ARGS[1]} characters'
	  }),
	  validate({
	    validator: 'isAlphanumeric',
	    passIfEmpty: true,
	    message: 'Name should contain alpha-numeric characters only'
	  })
  ];

  const emailValidator = [
    validate({ validator: 'isEmail', passIfEmpty: true, msg: '{VALUE} is not a valid email!' })
  ];

  const users = new mongooseClient.Schema({
    email: {type: String, unique: true, lowercase: true, validate: emailValidator},
    username: { type: String, required: true, unique: true, lowercase: true, validate: usernameValidator},
    password: { type: String },
    permissions: {type: Array},
    streamkey: { type: String, unique: true},
    isVerified: { type: Boolean, default: false },
    verifyToken: { type: String },
    verifyExpires: { type: Date },
    verifyChanges: { type: Object },
    resetToken: { type: String },
    resetExpires: { type: Date },
    banned:    {type: Boolean, 'default': false},
    partner: {type: Boolean, 'default': false},
    transcode: {type: Boolean, 'default': false},
    playerTranscodeReady: {type:Boolean, 'default': false},
    streamPassword: {type: String},
    passwordProtected: {type: Boolean, 'default': false},
    title: {type: String},
    live: {type: Boolean, 'default': false},
    poster: {type: String, 'default': ""},
    createdAt: { type: Date, 'default': Date.now },
    updatedAt: { type: Date, 'default': Date.now },
    patronTier: {type: Number},
    isPatron: {type: Boolean, 'default': false},
    isPatreonLinked: {type: Boolean, 'default': false},
    patreon: {type: Object},
    isTwitchLinked: {type: Boolean, 'default': false},
    twitch: {type: Object},
    ingestServer: {type: String},
    ingest: {type: Object, 'default': {live: false}},
    bans: {type: Array, 'default': []}
  }, {
    timestamps: true
  });

  return mongooseClient.model('users', users);
};
