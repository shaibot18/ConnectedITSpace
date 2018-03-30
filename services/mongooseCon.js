const config = require('config.json');
const mongoose = require('mongoose');

let connectionString;
if (process.env.VCAP_SERVICES) {
    const vcap_services = JSON.parse(process.env.VCAP_SERVICES);
    connectionString = vcap_services["MongoDB-Service"][0].credentials.uri;
}
else{
    connectionString = config.connectionString;
}

var connectionOptions = {
    // useMongoClient: true
}
mongoose.connect(connectionString,connectionOptions,function(err){
    console.error.bind(console, 'connection error:');
});

const db = mongoose.connection;
db.on('error', console.error('connection error:'));
mongoose.Promise = global.Promise;
module.exports = mongoose;
