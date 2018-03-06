var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var roomService = require('services/room.service');
var Q = require('q');
var mongoose = require('services/mongooseCon');
var Schema = mongoose.Schema;
var roomdataSchema = new Schema({
    SN: String,
    _RoomId: Schema.Types.ObjectId,
    Time: {
        type: Date,
        default: Date.now
    },
    TimeZone:{
        type: String,
        default: "+0800"
    },
    In: Number,
    Out: Number
});
roomdataSchema.index({Time: -1});
var Roomdata = mongoose.model('Roomdata',roomdataSchema);
var service = {};

service.add = add; 
service.getById = getById;
service.getByTimeRange = getByTimeRange;
service.getAllById = getAllById;
service.delete = _delete;
module.exports = service;

<<<<<<< HEAD
function getAllById(_RoomId) {
    let deferred = Q.defer();
    Roomdata.find({ 
        _RoomId: _RoomId,
    },function(err,res){
=======

function getAll(){
    var deferred = Q.defer();

    Roomdata.find({},function (err, roomdataList) {
>>>>>>> 6bf8c0ce851357a104ef8222bc6a01e76e0cb099
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve(res);    
    });

    return deferred.promise;
}

function add(roomdataParams) {
    let deferred = Q.defer();
    // validation
    let SN = roomdataParams.SN;
    roomService.getRoomBySN(SN)
        .then(function(room){
            if(room.length == 0){
                console.log('Invalid post: no existing room matches this SN ' + SN);
                deferred.reject('Invalid post: no existing room matches this SN ' + SN);
            }
            else if (room.length > 1){
                console.log('Invalid post: this SN '+ SN + 'matches too many rooms');
                deferred.reject('Invalid post: this SN '+ SN + 'matches too many rooms');                
            }
            else{
                roomdataParams._RoomId = room[0]._id; 
                saveRoom(roomdataParams);                
            }
        })
        .catch(function(err){
            deferred.reject(err.name + ': ' + err.message);
        })
    return deferred.promise;
    
    function saveRoom(roomdataParams){
        let roomdata = new Roomdata(roomdataParams);
        console.log('Saving roomdata ...');
        console.log('In is ' + roomdata.In + ' Out is' + roomdata.Out);
        console.log('Time is ' + Date.parse(roomdata.Time));
        roomdata.save(function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);
                deferred.resolve();
            });
    }   
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

function getByTimeRange(_RoomId,startTime,endTime){
    console.log('Start time is ' + startTime);
    console.log('End time is ' + endTime);
    var deferred = Q.defer();
    Roomdata.find({ 
        _RoomId: _RoomId,
        Time:{
            "$gte": startTime,
            "$lt": endTime
        }
    },function(err,res){
        if (err) deferred.reject(err.name + ': ' + err.message);
        console.log('Result is');
        console.log(res);
        deferred.resolve(res);    
    });
    return deferred.promise;
}

<<<<<<< HEAD
=======

function add(roomdataParams) {
    var deferred = Q.defer();
    // validation
    var MacAddress = roomdataParams.MacAddress;
    console.log('roomdataParams');
    console.log(roomdataParams);
    var room = roomService.getIdByMacAddress(MacAddress);
    roomService.getIdByMacAddress(MacAddress)
        .then(function(_RoomId){
            if(_RoomId.length == 0){
                deferred.reject('Invalid post: no existing room matches this mac address ' + MacAddress);
            }
            else if (_RoomId.length > 1){
                deferred.reject('Invalid post: this mac address '+ MacAddress + 'matches too many rooms');                
            }
            else{
                roomdataParams._RoomId = _RoomId[0]; 
                saveRoom(roomdataParams);                
            }
        })
        .catch(function(err){
            deferred.reject(err.name + ': ' + err.message);
        })
    return deferred.promise;
    
    function saveRoom(roomdataParams){
        var roomdata = new Roomdata({
            // MacAddress: roomdataParams.MacAddress,
            _RoomId: roomdataParams._RoomId,
            Time: new Date(parseInt(roomdataParams.Time)),
            TimeZone: roomdataParams.TimeZone,
            Direction: (roomdataParams.Direction == "In") ? true : false
        });
        console.log(roomdata);
        roomdata.save(function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);
                deferred.resolve();
                // console.log(doc);
                console.log('Roomdata received');
            });
    }   
}



>>>>>>> 6bf8c0ce851357a104ef8222bc6a01e76e0cb099
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