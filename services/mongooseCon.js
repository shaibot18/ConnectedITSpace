var config = require('config.json');
var mongoose = require('mongoose');
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
mongoose.connect(connectionString,connectionOptions,function(err){
    console.error.bind(console, 'connection error:');
});


var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
mongoose.Promise = global.Promise;
module.exports = mongoose;