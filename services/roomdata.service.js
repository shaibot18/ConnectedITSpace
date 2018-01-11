var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var roomService = require('services/room.service');
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
var roomdataSchema = new Schema({
    _RoomId: Schema.Types.ObjectId,
    MacAddress: String,
    Time: {
        type: Date,
        default: Date.now
    },
    TimeZone: String,
    Direction: Boolean
});
roomdataSchema.index({Time: -1});
var Roomdata = mongoose.model('Roomdata',roomdataSchema);
var service = {};

service.getAll = getAll;
service.getById = getById;
service.getByTimeRange = getByTimeRange;
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