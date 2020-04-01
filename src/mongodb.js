const MongoClient = require('mongodb').MongoClient;

module.exports = async function () {
  const app = this;

  const client = await MongoClient.connect(app.get('mongodb'), { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    return client;
  }).catch(error => {
    console.error(error)
  });

  app.set('mongodbClient', client);
};
