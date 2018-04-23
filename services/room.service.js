const Q = require('q');
const mongoose = require('services/dbConnection.service');

const Schema = mongoose.Schema;
const roomSchema = new Schema({
  placeName: String,
  country: String,
  city: String,
  building: String,
  timeZone: String,
  _userID: Schema.Types.ObjectId,
  SN: String,
  coordinates: [Number],
  area: Number,
  openTime: {
    type: String,
    default: '0930'
  },
  closeTime: {
    type: String,
    default: '1730'
  },
  totalNum: {
    type: Number,
    default: 0
  },
  curNum: {
    type: Number,
    default: 0
  },
  avgNum: {
    type: Number,
    default: 0
  },
  batteryLevel: {
    type: Number,
    default: 90
  }
});
const Room = mongoose.model('Room', roomSchema);
const service = {};
service.GetAll = GetAll;
service.GetRoomBySN = GetRoomBySN;
service.Update = Update;
service.Get = Get;
service.create = create;
service.getByUserId = GetByUserId;
service.updateBatteryLevel = updateBatteryLevel;
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

function updateBatteryLevel(_id, battery) {
  const deferred = Q.defer();
  Room.findByIdAndUpdate(_id, { $set: { batteryLevel: battery } }, { new: true }, (err, updatedRoom) => {
    if (err) { deferred.reject(err); }
    deferred.resolve(updatedRoom);
  });
  return deferred.promise;
}

function Get(_id) {
  const deferred = Q.defer();
  Room.findById(_id, (err, room) => {
    if (err) deferred.reject(`${err.name} : ${err.message}`);
    if (room) {
      deferred.resolve(room);
    }
  });
  return deferred.promise;
}

function GetByUserId(_userID) {
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
