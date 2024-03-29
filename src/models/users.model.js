// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const users = sequelizeClient.define('users', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    username: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    display_name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ''
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    verifyToken: {
      type: DataTypes.CHAR,
      allowNull: true
    },
    verifyShortToken: {
      type: DataTypes.CHAR,
      allowNull: true
    },
    verifyExpires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    verifyChanges: {
      type: DataTypes.JSON,
      allowNull: true
    },
    resetToken: {
      type: DataTypes.CHAR,
      allowNull: true
    },
    resetShortToken: {
      type: DataTypes.CHAR,
      allowNull: true
    },
    resetExpires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'First Stream on AngelThump!'
    },
    angel: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    stream_key: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    banned: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    offline_banner_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: `https://images-angelthump.nyc3.cdn.digitaloceanspaces.com/default_offline_banner.png`
    },
    profile_logo_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: `https://images-angelthump.nyc3.cdn.digitaloceanspaces.com/default_profile_picture.png`
    },
    followers: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0
    },
    stream_password: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ""
    },
    password_protect: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    nsfw: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    bans: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: false,
      defaultValue: []
    },
    patreon: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    twitch: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    unlist: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    timestamps: true,
    hooks: {
      beforeCount(options) {
        options.raw = true;
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  users.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return users;
};
