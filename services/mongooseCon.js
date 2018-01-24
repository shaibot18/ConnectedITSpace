var config = require('config.json');
var mongoose = require('mongoose');
var vcap_services = JSON.parse(process.env.VCAP_SERVICES);
var connectionString;
if (process.env.VCAP_SERVICES){
    var vcap_services = JSON.parse(process.env.VCAP_SERVICES);
    connectionString = vcap_services["MongoDB-Service"][0].credentials.uri;
}
else{
    connectionString = config.connectionString;
}
var connectionOptions = {
    // useMongoClient: true
}
mongoose.connect(connectionString,connectionOptions);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
module.exports = mongoose;