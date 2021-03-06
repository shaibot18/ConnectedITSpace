const Q = require('q');
const mongoose = require('services/dbConnection.service');
const RoomService = require('services/room.service');
const moment = require('moment');
const chalk = require('chalk');

const Schema = mongoose.Schema;
const roomdataSchema = new Schema({
  SN: String,
  _RoomId: Schema.Types.ObjectId,
  Time: {
    type: Date,
    default: Date.now,
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

service.RoomData = Roomdata;
service.add = add;

service.UpdateAllNum = UpdateAllNum;
service.UpdateTotal = UpdateTotal;
service.UpdateAvg = UpdateAvg;

service.getAllById = getAllById;
service.getByTimeRange = getByTimeRange;
service.DeleteRoomData = DeleteRoomData;
service.getAggRoomData = getAggRoomData;

module.exports = service;


function UpdateAllNum(_id) {
  const deferred = Q.defer();
  console.log('update function get called');
  RoomService.Get(_id)
    .then((room) => {
      const avgProm = UpdateAvg(_id);
      const totalProm = UpdateTotal(_id);
      const curProm = UpdateCur(_id);
      Promise.all([avgProm, totalProm, curProm])
        .then((values) => {
          const [avgNum, totalNum, curNum] = values;
          room.avgNum = avgNum;
          room.totalNum = totalNum;
          room.curNum = curNum;
          room.save();
          deferred.resolve({ totalNum, avgNum, curNum });
        })
        .catch((err) => {
          console.error(err);
          deferred.reject(err);
        });
    })
    .catch((err) => {
      console.error(err);
      deferred.reject(err);
    });
  return deferred.promise;
}

function UpdateCur(_id) {
  const deferred = Q.defer();
  RoomService.Get(_id)
    .then((room) => {
      const { openTime, closeTime, timeZone } = room;
      const zeroTime = moment().utcOffset(timeZone).startOf('day');
      const startTime = zeroTime.clone()
        .add(parseInt(openTime.substr(0, 2), 10), 'h')
        .add(parseInt(openTime.substr(2, 2), 10), 'm');
      const endTime = zeroTime.clone()
        .add(parseInt(closeTime.substr(0, 2), 10), 'h')
        .add(parseInt(closeTime.substr(2, 2), 10), 'm');
      let curNum = 0;        
      if (moment().isBetween(startTime, endTime)) {
        getByTimeRange(_id, startTime.valueOf(), moment().valueOf())
          .then((dataList) => {
            dataList.forEach((ele) => {
              curNum += ele.In - ele.Out;
            });
            deferred.resolve(curNum);
          });
      } else {
        deferred.resolve(curNum);
      }
    })
    .catch((err) => { deferred.reject(err); });
  return deferred.promise;
}

function UpdateAvg(_id) {
  const deferred = Q.defer();
  let avgNum = 0;
  let totalNum = 0;
  let dayNum = 0;
  let curDay = 0;
  let curMonth = 0;
  getAllById(_id)
    .then((dataList) => {
      dataList.forEach((element) => {
        const date = element.Time;
        if (date.getMonth() !== curMonth || date.getDate() !== curDay) {
          dayNum += 1;
          curDay = date.getDate();
          curMonth = date.getMonth();
        }
        totalNum += element.In;
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
  getAllById(_id)
    .then((dataList) => {
      dataList.forEach((element) => {
        totalNum += element.In;
      });
      deferred.resolve(totalNum);
    })
    .catch((err) => { deferred.reject(err); });
  return deferred.promise;
}

function getAllById(_RoomId) {
  const deferred = Q.defer();
  Roomdata.find({ _RoomId }, (err, res) => {
    if (err) deferred.reject(`${err.name}: ${err.message}`);
    deferred.resolve(res);
  });
  return deferred.promise;
}

function getAggRoomData(roomId, start, end) {
  const deferred = Q.defer();

  const aggPipeline = [
    {
      $match: {
        _RoomId: roomId,
        Time: { $gte: start, $lt: end }
      }
    },
    {
      $group: {
        _id: {
          index: { $substr: ['$Time', 0, 10] },
          _roomId: '$_RoomId'
        },
        room: { $first: '$_RoomId' },
        time: { $first: '$Time' },
        totalIn: { $sum: '$In' },
        totalOut: { $sum: '$Out' }
      }
    }
  ];

  Roomdata.aggregate(aggPipeline, (err, docs) => {
    if (err) {
      if (err) deferred.reject(`Error in aggregation: ${err}`);
    } else {
      deferred.resolve(docs);
    }
  });

  return deferred.promise;
}

function _createOrUpdateRoomData(roomData) {
  const deferred = Q.defer();
  Roomdata.findOneAndUpdate(
    {
      _RoomId: roomData._RoomId,
      In: roomData.In,
      Out: roomData.Out,
      Time: roomData.Time
    },
    roomData,
    { new: true, upsert: true, setDefaultsOnInsert: true },
    (err, doc) => {
      if (err) deferred.reject(`${err.name} : ${err.message}`);
      deferred.resolve(doc);
    }
  );
  return deferred.promise;
}

function add(roomdataParams) {
  const deferred = Q.defer();
  const SN = roomdataParams.SN;
  RoomService.GetRoomBySN(SN)
    .then((room) => {
      if (room.length === 0) {
        console.log(`Invalid post: no existing room matches SN: ${SN}`);
        deferred.reject(`Invalid post: no existing room matches SN: ${SN}`);
      } else if (room.length > 1) {
        console.log(`Invalid post: this SN ${SN} matches too many rooms`);
        deferred.reject(`Invalid post: this SN ${SN} matches too many rooms`);
      } else {
        roomdataParams._RoomId = room[0]._id;
        // timezone defaults to +0800
        Roomdata.find({
          _RoomId: roomdataParams._RoomId,
          In: roomdataParams.In,
          Out: roomdataParams.Out,
          Time: roomdataParams.Time
        }, (err, res) => {
          if (err) console.log(`${err.name}: ${err.message}`);
          if (res.length > 0) {
            console.log(`ROOMDATA SERVICE: record EXISTS. Lengh: ${res.length}, ignoring...`);
            deferred.resolve(res[0]);
          } else {
            _newDataRecord(roomdataParams)
              .then((rData) => {
                console.log(chalk.green(`ROOMDATA SERVICE: record SAVED. Time:${rData.Time}, In:${rData.In} Out:${rData.Out}`));
                deferred.resolve(rData);
              });
          }
        });
      }
    })
    .catch((err) => { deferred.reject(`${err.name}: ${err.message}`); });
  return deferred.promise;
}

function _newDataRecord(data) {
  const deferred = Q.defer();
  const record = new Roomdata(data);
  record.save((err, doc) => {
    if (err) deferred.reject(`${err.name}: ${err.message}`);
    deferred.resolve(doc);
  });
  return deferred.promise;
}

function getByTimeRange(_RoomId, startTime, endTime) {
  const deferred = Q.defer();
  Roomdata.find({
    _RoomId,
    Time: {
      $gte: startTime,
      $lt: endTime
    }
  }, (err, res) => {
    if (err) deferred.reject(`${err.name} : ${err.message}`);
    deferred.resolve(res);
  });
  return deferred.promise;
}

function DeleteRoomData(_id) {
  const deferred = Q.defer();
  Roomdata.remove(
    { _RoomId: _id },
    (err) => {
      if (err) deferred.reject(`${err.name}: ${err.message}`);
      deferred.resolve();
    }
  );
  return deferred.promise;
}
