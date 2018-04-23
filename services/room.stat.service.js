const Q = require('q');
const mongoose = require('services/dbConnection.service');
const RoomDataService = require('services/roomdata.service');
const moment = require('moment');
const chalk = require('chalk');
const _ = require('underscore');

const Schema = mongoose.Schema;

const roomStatSchema = new Schema({
  _roomId: String,
  recordDate: {
    type: Date,
    default: Date.now,
  },
  recordTimeZone: {
    type: String,
    default: '+0800'
  },
  stats: [
    {
      hourRange: Number, // 9 for 9-10, 10 for 10-11 ... 17 for 17-18 etc.
      in: Number,
      out: Number,
      accu: Number // accumulated visitor since the begining of the day
    }
  ]
});

roomStatSchema.index({
  _roomId: 1, recordDate: -1
});

const RoomStat = mongoose.model('RoomStat', roomStatSchema);
const service = {};

service.RoomStat = RoomStat;
service.getAllStatsById = getAllStatsById;
service.getStatsByIdDate = getStatsByIdDate;
service.getStatsByTimeRange = getStatsByTimeRange;
service.createRoomStatEntry = createRoomStatEntry;
service.deleteRoomStatsEntry = deleteRoomStatsEntry;
service.deleteRoomStatsEntryByDateRange = deleteRoomStatsEntryByDateRange;
service.createOrUpdateRoomStatEntry = createOrUpdateRoomStatEntry;
service.updateStatByIdAndDate = updateStatByIdAndDate;
service.roomStatHouseKeep = roomStatHouseKeep;
module.exports = service;

function getAllStatsById(_roomId) {
  const deferred = Q.defer();
  RoomStat.find({ _roomId }, (err, res) => {
    if (err) deferred.reject(`${err.name}: ${err.message}`);
    deferred.resolve(res);
  });
  return deferred.promise;
}

function getStatsByIdDate(_roomId, queryDate) {
  const deferred = Q.defer();
  RoomStat.findOne({
    _roomId,
    recordDate: {
      $gte: queryDate.toDate(),
      $lt: moment(queryDate).add(1, 'days').toDate()
    }
  }, (err, res) => {
    if (err) deferred.reject(`${err.name} : ${err.message}`);
    deferred.resolve(res);
  });
  return deferred.promise;
}

function getStatsByTimeRange(_roomId, startTime, endTime) {
  const deferred = Q.defer();
  RoomStat.find({
    _roomId,
    recordDate: {
      $gte: startTime.toDate(),
      $lt: moment(endTime).add(1, 'days').toDate()
    }
  }, (err, res) => {
    if (err) deferred.reject(`${err.name} : ${err.message}`);
    deferred.resolve(res);
  });
  return deferred.promise;
}

function createRoomStatEntry(obj) {
  const deferred = Q.defer();
  const roomStatEntry = new RoomStat(obj);
  roomStatEntry.save((err, doc) => {
    if (err) deferred.reject(`${err.name} : ${err.message}`);
    deferred.resolve(doc);
  });
  return deferred.promise;
}

function deleteRoomStatsEntry(id, date) {
  const deferred = Q.defer();

  RoomStat.remove(
    {
      _roomId: id,
      recordDate: date
    },
    (err, queryResult) => {
      if (err) deferred.reject(`${err.name}: ${err.message}`);
      deferred.resolve(queryResult);
    }
  );

  return deferred.promise;
}

function deleteRoomStatsEntryByDateRange(id, startDate, endDate) {
  const deferred = Q.defer();

  RoomStat.remove(
    {
      _roomId: id,
      recordDate: {
        $gte: startDate,
        $lte: endDate
      }
    },
    (err, queryResult) => {
      if (err) deferred.reject(`${err.name}: ${err.message}`);
      deferred.resolve(queryResult);
    }
  );

  return deferred.promise;
}

function createOrUpdateRoomStatEntry(obj) {
  const deferred = Q.defer();
  RoomStat.findOneAndUpdate(
    {
      _roomId: obj._roomId,
      recordDate: obj.recordDate,
      recordTimeZone: obj.recordTimeZone
    },
    obj,
    { new: true, upsert: true, setDefaultsOnInsert: true },
    (err, doc) => {
      if (err) deferred.reject(`${err.name} : ${err.message}`);
      deferred.resolve(doc);
    }
  );
  return deferred.promise;
}

function updateStatByIdAndDate(doc) {
  const deferred = Q.defer();

  // const tObj = {
  //   _roomId: doc._id,
  //   recordDate: 
  // };

  // RoomStat.findOneAndUpdate(
  //   {
  //     _roomId: doc._roomId,
  //     recordDate: doc.recordDate,
  //   },
  //   tObj,
  //   { new: true, upsert: true, setDefaultsOnInsert: true },
  //   (err, doc) => {
  //     if (err) deferred.reject(`${err.name} : ${err.message}`);
  //     deferred.resolve(doc);
  //   }
  // );
  return deferred.promise;
}

function roomStatHouseKeep() {
  const deferred = Q.defer();
  RoomDataService.RoomData.find({}, (err, docs) => {
    if (err) deferred.reject(err);
    else {
      console.log('Starting housekeeping...'); // eslint-disable-line no-console
      let uniqDocs = _.uniq(_.sortBy(docs, '_RoomId'), true);
      uniqDocs = _.map(uniqDocs, (e) => {
        return {
          uniqId: String(e._RoomId) + ':' + moment(e.Time).format('YYYYMMDD') + ':' + moment(e.Time).format('H') + ':' + e.TimeZone,
          _roomId: e._RoomId,
          In: e.In,
          Out: e.Out,
          recordDate: moment(e.Time).format('YYYYMMDD'),
          recordTime: moment(e.Time).format('H'),
          recordTimeZone: e.TimeZone
        };
      });

      // obtain a list of room ids that have records
      const roomIds = _.uniq(_.map(uniqDocs, e => String(e._roomId)), true);

      // obtain a list of dates with records
      const recordDates = _.uniq(_.map(uniqDocs, e => e.recordDate), true);

      // obtain a list of timezones with records
      const recordTimeZones = _.uniq(_.map(uniqDocs, e => e.recordTimeZone), true);

      // generate hour range list [0,1,2,4...23]
      const hoursOfDay = _.range(24);

      roomIds.forEach((r) => { // each room
        recordDates.forEach((d) => { // each day
          recordTimeZones.forEach((t) => { // each timezone
            const obj = {
              _roomId: r,
              recordDate: moment(d).format('YYYY-MM-DD'),
              recordTimeZone: t,
              stats: []
            };

            const totalAccu = 0;

            hoursOfDay.forEach((h) => { // each hour
              const filterStr = String(r) + ':' + d + ':' + h + ':' + t;
              let totalIn = 0;
              let totalOut = 0;

              const tmpArr = _.filter(uniqDocs, e => (e.uniqId === filterStr));

              if (tmpArr && tmpArr.length > 0) {
                tmpArr.forEach((e) => {
                  totalIn += e.In;
                  totalOut += e.Out;
                });

                const vObj = {
                  hourRange: h,
                  in: totalIn,
                  out: totalOut,
                  accu: totalAccu + totalIn
                };

                obj.stats.push(vObj);
              }
            });
            // createRoomStatEntry(obj);
            createOrUpdateRoomStatEntry(obj);
          });
        });
      });

      deferred.resolve();
      console.log('Done housekeeping, all clean now ...'); // eslint-disable-line no-console
    }
  });
  return deferred.promise;
}
