var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('roomdata');

var service = {};

service.getAll = getAll;
service.getById = getById;
service.add = add;
service.delete = _delete;

module.exports = service;

function getAll(){
    var deferred = Q.defer();

    db.roomdata.find({}).toArray(function (err, roomdataList) {
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

    db.users.findById(_id, function (err, user) {
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

function add(roomdata) {
    var deferred = Q.defer();
    console.log(roomdata);
    // validation
    
    db.roomdata.insert(
        roomdata,
        function (err, doc) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            deferred.resolve();
            console.log('Roomdata received');
        });
    return deferred.promise;
}



function _delete(_id) {
    var deferred = Q.defer();

    db.users.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}