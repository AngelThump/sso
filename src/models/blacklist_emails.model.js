// See https://sequelize.org/master/manual/model-basics.html
// for more of what you can do here.
const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get("sequelizeClient");
  const blacklistEmails = sequelizeClient.define(
    "blacklist_emails",
    {
      email: {
        type: DataTypes.TEXT,
        allowNull: false,
        primaryKey: true,
      },
    },
    {
      hooks: {
        beforeCount(options) {
          options.raw = true;
        },
      },
    }
  );

  // eslint-disable-next-line no-unused-vars
  blacklistEmails.associate = function (models) {
    // Define associations here
    // See https://sequelize.org/master/manual/assocs.html
  };

  return blacklistEmails;
};
