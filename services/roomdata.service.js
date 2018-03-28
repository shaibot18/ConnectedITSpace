const _ = require('lodash');
const roomService = require('services/room.service');
const Q = require('q');
const mongoose = require('services/mongooseCon');

const Schema = mongoose.Schema;
const roomdataSchema = new Schema({
  SN: String,
  _RoomId: Schema.Types.ObjectId,
  Time: {
    type: Date,
    default: Date.now
  },
  TimeZone: {
    type: String,
    default: '+0800'
  },
  In: Number,
  Out: Number
});
roomdataSchema.index({
  Time: -1
});
const Roomdata = mongoose.model('Roomdata', roomdataSchema);
const service = {};

service.add = add;
service.getByTimeRange = getByTimeRange;
service.getAllById = getAllById;
service.delete = _delete;
module.exports = service;

function getAllById(_RoomId) {
  const deferred = Q.defer();
  Roomdata.find({ _RoomId }, (err, res) => {
    if (err) deferred.reject(err.name + ': ' + err.message);
    deferred.resolve(res);
  });
  return deferred.promise;
}

function add(roomdataParams) {
  const deferred = Q.defer();
  const SN = roomdataParams.SN;
  roomService.getRoomBySN(SN)
    .then((room) => {
      if (room.length === 0) {
        console.log(`Invalid post: no existing room matches SN: ${SN}`);
        deferred.reject(`Invalid post: no existing room matches SN: ${SN}`);
      } else if (room.length > 1) {
        console.log('Invalid post: this SN ' + SN + 'matches too many rooms');
        deferred.reject('Invalid post: this SN ' + SN + 'matches too many rooms');
      } else {
        roomdataParams._RoomId = room[0]._id;
        saveRoom(roomdataParams);
      }
    })
    .catch((err) => { deferred.reject(err.name + ': ' + err.message); });
  return deferred.promise;
  function saveRoom(roomdataParams) {
    const roomdata = new Roomdata(roomdataParams);
    console.log('Saving roomdata ...');
    console.log(`In is ${roomdata.In} Out is ${roomdata.Out}`);
    console.log(`Time is ${Date.parse(roomdata.Time)}`);
    roomdata.save((err, doc) => {
      if (err) deferred.reject(err.name + ': ' + err.message);
      deferred.resolve();
    });
  }
}

function getByTimeRange(_RoomId, startTime, endTime) {
  console.log(`Start time is ${startTime}`);
  console.log(`End time is ${endTime}`);
  const deferred = Q.defer();
  Roomdata.find({
    _RoomId,
    Time: {
      $gte: startTime,
      $lt: endTime
    }
  }, (err, res) => {
    if (err) deferred.reject(err.name + ': ' + err.message);
    console.log('Result is');
    console.log(res);
    deferred.resolve(res);
  });
  return deferred.promise;
}

function _delete(_id) {
  const deferred = Q.defer();
  Roomdata.remove(
    { _id: mongoose.helper.toObjectID(_id) },
    (err) => {
      if (err) deferred.reject(err.name + ': ' + err.message);
      deferred.resolve();
    }
  );

  return deferred.promise;
}