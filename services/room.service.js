var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
<<<<<<< HEAD
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
=======
var mongoose = require('services/mongooseCon');
>>>>>>> 5b6835059e8a34eeac0f5c76bf61a7d7aaa257b9
var Schema = mongoose.Schema;
var roomSchema = new Schema({
    country: String, 
    city: String,
    building: String,
    _userID: Schema.Types.ObjectId,
    macAddress: String
});
var Room = mongoose.model('Room',roomSchema);

var service = {};

service.getById = getById;
service.getByUserId = getByUserId;
service.getIdByMacAddress = getIdByMacAddress;
service.getAll = getAll;
service.create = create;
service.delete = _delete;

service.update = update;

module.exports = service;


function getByUserId(_userID){
    var deferred = Q.defer();
    Room.find({_userID : _userID},function (err,res){
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (res) {
            deferred.resolve(res);
        } else {
            deferred.resolve();
        }
    });
    return deferred.promise;
}

function getIdByMacAddress(macAddress) {
    var deferred = Q.defer();
    Room.find({macAddress: macAddress})
        .select('')
        .exec(function (err,res) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            if (res) {
                deferred.resolve(res);
            } else {
                deferred.resolve();
            }
        });
    return deferred.promise;
}

function getAll() {
    var deferred = Q.defer();
    Room.find({},function (err, roomList) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (roomList) {
            deferred.resolve(roomList);
        } else {
            // user not found
            deferred.resolve();
        }
    });
    return deferred.promise;
}

function getById(_id) {
    var deferred = Q.defer();
    Room.findById(_id, function (err, room) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (room) {
            // return user (without hashed password)
            deferred.resolve(room);
        } else {
            // user not found
            deferred.resolve();
        }
    });
    return deferred.promise;
}

function create(roomParam) {
    var deferred = Q.defer();
    var room = new Room(roomParam);
    room.save(function (err, room) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            deferred.resolve();
    });
    return deferred.promise;
}

function _delete(_id) {
    var deferred = Q.defer();
    Room.remove(
        { _id: _id },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            deferred.resolve();
        });
    return deferred.promise;
}

function update(_id, roomParam) {
    var deferred = Q.defer();
    // validation
    // fields to update
    var set = roomParam;

    Room.update(
        { _id: mongo.helper.toObjectID(_id) },
        { $set: set },
        function (err, doc) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            deferred.resolve();
        });
    return deferred.promise;
}

