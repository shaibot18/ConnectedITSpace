
var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
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
    useMongoClient: true
}
mongoose.connect(connectionString,connectionOptions);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
var Schema = mongoose.Schema;
var roomdataSchema = new Schema({
    _roomID: Schema.Types.ObjectId,
    macAddress: String,
    Time: Date,
    TimeZone: String, 
    Direction: Boolean
});
var Roomdata = mongoose.model('Roomdata',roomdataSchema);
var service = {};

service.getAll = getAll;
service.getById = getById;
service.add = add;
service.delete = _delete;

module.exports = service;

function getAll(){
    var deferred = Q.defer();

    Roomdata.find({},function (err, roomdataList) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (roomdataList) {
            deferred.resolve(roomdataList);
        } else {
            // user not found
            deferred.resolve();
        }
    });

    return deferred.promise;
}


function getById(_id) {
    var deferred = Q.defer();

    Roomdata.findById(_id, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (user) {
            // return user (without hashed password)
            deferred.resolve(_.omit(user, 'hash'));
        } else {
            // user not found
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function add(roomdataParams) {
    var deferred = Q.defer();
    // validation
    var roomdata = new Roomdata(roomdataParams);
    roomdata.save(function (err, doc) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            deferred.resolve();
            console.log('Roomdata received');
        });
    return deferred.promise;
}



function _delete(_id) {
    var deferred = Q.defer();

    Roomdata.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}