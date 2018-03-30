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
  totalNum: {
    type: Number,
    default: 0
  },
  avgNum: {
    type: Number,
    default: 0
  }
});
const Room = mongoose.model('Room', roomSchema);
const service = {};
service.GetAll = GetAll;
service.GetRoomBySN = GetRoomBySN;
service.Update = Update;
service.get = get;
service.create = create;
service.getByUserId = getByUserId;
service.delete = _delete;
module.exports = service;


function Update(_id, room) {
  const deferred = Q.defer();
  Room.findByIdAndUpdate(_id, room, { new: true }, (err, updatedRoom) => {
    if (err) { deferred.reject(err); }
    deferred.resolve(updatedRoom);
  });
  return deferred.promise;
}

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
  const deferred = Q.defer();
  Room.find({ _userID }, (err, res) => {
    if (err) deferred.reject(`${err.name}: ${err.message}`);
    if (res) {
      deferred.resolve(res);
    } else {
      deferred.resolve();
    }
  });
  return deferred.promise;
}

function GetRoomBySN(SN) {
  const deferred = Q.defer();
  Room.find({ SN })
    .select('')
    .exec((err, res) => {
      if (err) deferred.reject(`${err.name}: ${err.message}`);
      if (res) {
        deferred.resolve(res);
      } else {
        deferred.resolve();
      }
    });
  return deferred.promise;
}

function GetAll() {
  const deferred = Q.defer();
  Room.find({}, (err, roomList) => {
    if (err) deferred.reject(`${err.name}: ${err.message}`);
    if (roomList) {
      deferred.resolve(roomList);
    } else {
      deferred.resolve();
    }
  });
  return deferred.promise;
}

function create(roomParam) {
  const deferred = Q.defer();
  const room = new Room(roomParam);
  room.save((err, doc) => {
    if (err) deferred.reject(`${err.name}: ${err.message}`);
    deferred.resolve(doc);
  });
  return deferred.promise;
}

function _delete(_id) {
  const deferred = Q.defer();
  Room.remove({ _id }, (err) => {
    if (err) deferred.reject(`${err.name}: ${err.message}`);
    deferred.resolve();
  });
  return deferred.promise;
}
