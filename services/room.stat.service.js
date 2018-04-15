const Q = require('q');
const mongoose = require('services/dbConnection.service');
const RoomDataService = require('services/roomdata.service');
const moment = require('moment');
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
  stats:[
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
service.roomStatHouseKeep = roomStatHouseKeep;
module.exports = service;

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
      const roomIds = _.uniq(_.map(uniqDocs, (e) => {
        return String(e._roomId);
      }), true);

      // obtain a list of dates with records
      const recordDates = _.uniq(_.map(uniqDocs, (e) => {
        return e.recordDate;
      }), true);

      // obtain a list of timezones with records
      const recordTimeZones = _.uniq(_.map(uniqDocs, (e) => {
        return e.recordTimeZone;
      }), true);

      // generate hour range list [0,1,2,4...23]
      const hoursOfDay = _.range(24);

      let indexes = [];

      roomIds.forEach((r) => {
        recordDates.forEach((d) => {
          recordTimeZones.forEach((t) => {

            let obj = {
              _roomId: r,
              recordDate: moment(d),
              recordTimeZone: t,
              stats: []
            };
          
            let totalAccu = 0;
            
            hoursOfDay.forEach((h) => {

              let filterStr = String(r) + ':' + d + ':' + h + ':' + t;
              let totalIn = 0;
              let totalOut = 0;

              const tmpArr = _.filter(uniqDocs, (e) => {
                return e.uniqId == filterStr;
              });

              if (tmpArr && tmpArr.length > 0) {

                tmpArr.forEach((e)=>{
                  totalIn += e.In;
                  totalOut += e.Out;
                });

                let vObj = {
                  hourRange: h,
                  in: totalIn,
                  out: totalOut,
                  accu: totalAccu + totalIn - totalOut
                };

                obj.stats.push(vObj)

                createRoomStatEntry(obj);

              }
            })
          })
        })
      });

      deferred.resolve();
      console.log('Done housekeeping, all clean now ...'); // eslint-disable-line no-console
    }
  });
  return deferred.promise;
}

function createRoomStatEntry(obj) {
  
  const roomStatEntry = new RoomStat(obj);
  roomStatEntry.save((error, doc) => {
    if (error) console.log(`${error.name}: ${error.message}`);
  });
}

// function saveRoomStatEntry(){
  
// }

// function getUniqDataEntries(elements){
  
// }