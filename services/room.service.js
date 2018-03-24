const Q = require('q');
const mongoose = require('services/mongooseCon');

const Schema = mongoose.Schema;
const roomSchema = new Schema({
  country: String,
  city: String,
  building: String,
  timeZone: String,
  _userID: Schema.Types.ObjectId,
  SN: String,
});
const Room = mongoose.model('Room', roomSchema);
const service = {};

service.get = get;
service.create = create;
service.getByUserId = getByUserId;
service.getRoomBySN = getRoomBySN;
service.getAll = getAll;
service.delete = _delete;
service.update = update;
module.exports = service;

function get(_id) {
  const deferred = Q.defer();
  Room.findById(_id, (err, room) => {
    if (err) deferred.reject(`${err.name} : ${err.message}`);
    if (room) {
      deferred.resolve(room);
    } else {
      deferred.resolve();
    }
  });
  return deferred.promise;
}

function getByUserId(_userID) {
  var deferred = Q.defer();
  Room.find({ _userID: _userID }, function (err, res) {
    if (err) deferred.reject(err.name + ': ' + err.message);
    if (res) {
      deferred.resolve(res);
    } else {
      deferred.resolve();
    }
  });
  return deferred.promise;
}

function getRoomBySN(SN) {
  var deferred = Q.defer();
  Room.find({ SN: SN })
    .select('')
    .exec(function (err, res) {
      if (err) deferred.reject(err.name + ': ' + err.message);
      if (res) {
        deferred.resolve(res);
      } else {
        deferred.resolve();
      }
    })
  return deferred.promise;
}


function getAll() {
  var deferred = Q.defer();
  Room.find({}, function (err, roomList) {
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

