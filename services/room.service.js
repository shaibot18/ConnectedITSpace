var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongoose = require('mongoose');
var connectionString = config.connectionString;
var connectionOptions = {
    useMongoClient: true
}
mongoose.connect(connectionString,connectionOptions);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
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
service.create = create;
service.update = update;
service.delete = _delete;

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
    })
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

function _delete(_id) {
    var deferred = Q.defer();

    Room.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            deferred.resolve();
        });

    return deferred.promise;
}