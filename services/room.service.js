const Q = require('q');
const mongoose = require('services/mongooseCon');
const RoomDataService = require('services/roomdata.service.js');

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
service.UpdateTotal = UpdateTotal;
service.UpdateAvg = UpdateAvg;
service.Update = Update;
service.get = get;
service.create = create;
service.getByUserId = getByUserId;
service.getRoomBySN = getRoomBySN;
service.getAll = getAll;
service.delete = _delete;
module.exports = service;

const intervalObj = setInterval(() => {
  getAll()
    .then((roomList) => {
      roomList.forEach((room) => {
        const _id = room._id;
        const avgProm = UpdateAvg(_id);
        const totalProm = UpdateTotal(_id);
        Promise.all([avgProm, totalProm])
          .then((values) => {
            const [avgNum, totalNum] = values;
            Update(_id, { avgNum, totalNum })
              .catch((err) => { console.error(err); });
          })
          .catch((err) => { console.error(err); });
      });
    })
    .catch((err) => { console.error(err); });
}, 5 * 1000 * 60);

function UpdateAvg(_id) {
  const deferred = Q.defer();
  let avgNum = 0;
  let totalNum = 0;
  let dayNum = 0;
  let curDay = 0;
  let curMonth = 0;
  RoomDataService.getAllById(_id)
    .then((dataList) => {
      dataList.forEach((element) => {
        const date = element.Time;
        if (date.getMonth() !== curMonth && date.getDate() !== curDay) {
          dayNum += 1;
          curDay = date.getDate();
          curMonth = date.getMonth();
        }
        totalNum += element.In - element.Out;
      });
      avgNum = (dayNum === 0) ? 0 : Math.round(totalNum / dayNum);
      deferred.resolve(avgNum);
    })
    .catch((err) => { deferred.reject(err); });
  return deferred.promise;
}

function UpdateTotal(_id) {
  const deferred = Q.defer();
  let totalNum = 0;
  RoomDataService.getAllById(_id)
    .then((dataList) => {
      dataList.forEach((element) => {
        totalNum += element.In - element.Out;
      });
      deferred.resolve(totalNum);
    })
    .catch((err) => { deferred.reject(err); });
  return deferred.promise;
}

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

function getRoomBySN(SN) {
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
    })
  return deferred.promise;
}


function getAll() {
  const deferred = Q.defer();
  Room.find({}, (err, roomList) => {
    if (err) deferred.reject(`${err.name}: ${err.message}`);
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
