var config = require('config.json');
var mongoose = require('mongoose');
var connectionString = config.connectionString;
var connectionOptions = {
    useMongoClient: true
}
mongoose.connect(connectionString,connectionOptions,function(err){
    console.error.bind(console, 'connection error:');
});
mongoose.Promise = global.Promise;
module.exports = mongoose;