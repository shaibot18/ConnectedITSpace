const Q = require('q');
const mongoose = require('services/dbConnection.service');
const RoomDataService = require('services/roomdata.service');
const moment = require('moment');
const _ = require('underscore');
const chalk = require('chalk');

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
// service.updateStatByIdAndDate = updateStatByIdAndDate;
service.roomStatHouseKeep = _roomStatAggregate;
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

function newRoomStatEntry(obj) {
  const deferred = Q.defer();

  RoomStat.find({
    _roomId: obj._roomId,
    recordDate: obj.recordDate
  }, (err, res) => {
    if (err) console.log(`${err.name}: ${err.message}`);
    if (res.length > 0) {
      console.log(`ROOM STAT SERVICE: record EXISTS. Lengh: ${res.length}, ignoring...`);
    } else {
      createRoomStatEntry(obj)
        .then((rData) => {
          console.log(chalk.green(`ROOM STAT SERVICE: stat SAVED. Stats:${JSON.stringify(rData.stats)}`));
          deferred.resolve(rData);
        });
    }
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

// function updateStatByIdAndDate(doc) {
//   const deferred = Q.defer();

//   const tObj = {
//     _roomId: doc._id,
//     recordDate: 
//   };

//   RoomStat.findOneAndUpdate(
//     {
//       _roomId: doc._roomId,
//       recordDate: doc.recordDate,
//     },
//     tObj,
//     { new: true, upsert: true, setDefaultsOnInsert: true },
//     (err, doc) => {
//       if (err) deferred.reject(`${err.name} : ${err.message}`);
//       deferred.resolve(doc);
//     }
//   );
//   return deferred.promise;
// }

/**
 * House keeping function to recalculate all data
 * Should be used with caution
 */
function roomStatHouseKeep() {
  const deferred = Q.defer();
  RoomDataService.RoomData.find({}, (err, docs) => {
    if (err) deferred.reject(err);
    else {
      console.log('ROOMSTAT Service: Starting housekeeping...'); // eslint-disable-line no-console
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

// run house keeper every hour
// setInterval(_roomStatHouseKeepByHour, 3600 * 1000);
setInterval(_roomStatAggregate, 3600 * 1000);

function _roomStatAggregate() {
  const deferred = Q.defer();

  console.log(chalk.red('ROOM STAT SERVICE: Start house keeping...')); // eslint-disable-line no-console

  const aggPipeline = [
    {
      $group: {
        _id: {
          index: { $substr: ['$Time', 0, 13] },
          _roomId: '$_RoomId',
          sn: '$SN'
        },
        room: { $first: '$_RoomId' },
        sn: { $first: '$SN' },
        time: { $first: '$Time' },
        totalIn: { $sum: '$In' },
        totalOut: { $sum: '$Out' }
      }
    },
    {
      $addFields: {
        stats: {
          hourRange: '$time',
          in: '$totalIn',
          out: '$totalOut'
        }
      }
    },
    {
      $project: {
        room: 1,
        sn: 1,
        time: 1,
        stats: 1
      }
    },
    {
      $group: {
        _id: {
          day: { $substr: ['$time', 0, 10] },
          _roomId: '$_RoomId',
          sn: '$SN'
        },
        room: { $first: '$room' },
        sn: { $first: '$sn' },
        time: { $first: '$time' },
        stats: { $addToSet: '$stats' },
      }
    }
  ];

  let countTotal = 0;

  RoomDataService.RoomData.aggregate(aggPipeline, (err, documents) => {
    if (err) deferred.reject(`Error in aggregation: ${err}`);
    documents.forEach((doc) => {
      const rEntry = {
        _roomId: doc.room,
        recordDate: moment(doc.time).format('YYYY-MM-DD'),
        stats: doc.stats.map((e) => {
          return {
            hourRange: moment(e.hourRange).hours(),
            in: e.in,
            out: e.out
          };
        })
      };

      newRoomStatEntry(rEntry)
        .then(() => countTotal++)
        .catch((entryerr) => {
          if (entryerr) deferred.reject(`Error in saving entry: ${entryerr}`);
        });
    });

    deferred.resolve(documents);
    console.log(chalk.red('ROOM STAT SERVICE: DONE house keeping.')); // eslint-disable-line no-console
  });

  return deferred.promise;
}

function _roomStatHouseKeepByHour() {
  const curHr = moment().format('hh');
  const curDate = moment().format('YYYY-MM-DD');
  const startTime = moment(`${curDate} ${curHr}:00:00`);
  const endTime = moment(startTime).add(1, 'h');

  // const startTime = moment('2018-04-12 01:00:00');
  // const endTime = moment('2018-04-21 01:00:00');

  RoomDataService.RoomData.find({
    Time: {
      $gte: startTime,
      $lt: endTime
    }
  }, (err, docs) => {
    if (err) console.log(chalk.red(err));
    else {
      console.log(chalk.red(`START house keeping ${startTime.format('YYYY-MM-DD HH:mm:ss')} -> ${endTime.format('YYYY-MM-DD HH:mm:ss')}`)); // eslint-disable-line no-console
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
      console.log(chalk.red(`DONE house keeping ${startTime.format('YYYY-MM-DD HH:mm:ss')} -> ${endTime.format('YYYY-MM-DD HH:mm:ss')}`)); // eslint-disable-line no-console
    }
  });
}

