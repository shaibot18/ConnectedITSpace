const config = require('config.json');
const mongoose = require('mongoose');

let connectionString = '';
if (process.env.VCAP_SERVICES) {
  const vcapServices = JSON.parse(process.env.VCAP_SERVICES);
  connectionString = vcapServices['MongoDB-Service'][0].credentials.uri;
} else {
  connectionString = config.connectionString;
}

const connectionOptions = {
  useMongoClient: true,
  autoIndex: false
};

mongoose.connect(connectionString, connectionOptions, (err) => {
  console.error.bind(console, `connection error: ${err}`); // eslint-disable-line no-console
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:')); // eslint-disable-line no-console
mongoose.Promise = global.Promise;
module.exports = mongoose;
