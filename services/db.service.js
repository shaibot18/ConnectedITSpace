// This service is used to perform global db operations
const mongoose = require('services/dbConnection.service');
const RoomDataService = require('services/roomdata.service.js');
const Q = require('q');

const Schema = mongoose.Schema;
const dbCleanSchema = new Schema({
  removeDuplicates: {
    Date: { type: Date, default: Date.now },
    Total: Number
  }
});
const DbClean = mongoose.model('DbClean', dbCleanSchema);
const service = {};
service.removeDuplicates = removeDuplicates;
service.adjustTimeZone = adjustTimeZone;
module.exports = service;
const RoomData = RoomDataService.RoomData;

// This function is used to remove data with the same time
// caused by hardware error
function removeDuplicates() {
  console.log('remove function run');
  const deferred = Q.defer();
  RoomData.aggregate([{
    $group: {
      _id: { Time: '$Time' },
      dups: { $push: '$_id' },
      count: { $sum: 1 }
    }
  },
  {
    $match: {
      count: { $gt: 1 }
    }
  }], (err, documents) => {
    let total = 0;
    if (err) deferred.reject(`Error in aggregation: ${err}`);
    documents.forEach((doc) => {
      doc.dups.shift();
      total += doc.dups.length;
      RoomData.remove(
        { _id: { $in: doc.dups } },
        (error) => {
          if (error) deferred.reject(`Error in removing duplicates: ${error}`);
        }
      );
    });
    const dbClean = new DbClean({
      removeDuplicates: { Date: Date.now(), Total: total }
    });
    console.log({ Date: Date.now(), Total: total });
    dbClean.save();
  });
  deferred.resolve();
  return deferred.promise;
}

function adjustTimeZone() {
  const deferred = Q.defer();
  console.log('Adjust function run');
  RoomData.find({}, (err, docs) => {
    if (err) deferred.reject(err);
    else {
      docs.forEach((doc) => {
        doc.Time -= 8 * 3600 * 1000;
        doc.save();
      });
      deferred.resolve();
    }
  });
  return deferred.promise;
}
