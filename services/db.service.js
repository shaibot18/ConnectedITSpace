// This service is used to perform global db operations
const mongoose = require('service/mongooseCon');
const RoomDataService = require('services/roomdata.service.js');
const Q = require('q');
const config = require('config.json');

const Schema = mongoose.Schema;
const dbCleanSchema = new Schema({
  removeDuplicates: {
    type: Date,
    default: Date.now
  },
});
const service = {};
service.removeDuplicates = removeDuplicates;
module.exports = service;

// This function is used to remove data with the same time
// caused by hardware error
const RoomData = RoomDataService.RoomData;
const removeDuplicates = function () {
  RoomData.aggregate([
    {
      $group: {
        _id: { Time: '$cust_time' },
        dups: { $push: '$_id' },
        count: { $sum: 1 }
      }
    },
    {
      $match: { count: { $gt: 1 } }
    }
  ])
    .forEach((doc) => {
      doc.dups.shift();
      RoomData.remove({ _id: { $in: doc.dups } });
    });
};

