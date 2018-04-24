const Q = require('q');
const chalk = require('chalk');
const mongoose = require('services/dbConnection.service');

const Schema = mongoose.Schema;
const rawDataSchema = new Schema({
  cmd: String,
  flag: String,
  status: String,
  data: [String],
  Time: {
    type: Date,
    default: Date.now,
  },
});
rawDataSchema.index({
  Time: -1
});
const RawData = mongoose.model('RawData', rawDataSchema);
const service = {};
service.add = add;
module.exports = service;

function add(rawDataParams) {
  if (rawDataParams.data) {
    if (typeof rawDataParams.data === 'string') {
      rawDataParams.data = [rawDataParams.data];
    }
  }
  const deferred = Q.defer();

  _createOrUpdateRawData(rawDataParams)
    .then((doc) => {
      console.log(chalk.yellow(`${doc} persisted success`));
    });

  // const rawData = new RawData(rawDataParams);
  // rawData.save((err, doc) => {
  //   if (err) deferred.reject(err);
  //   else {
  //     deferred.resolve(doc);
  //     console.log(doc);
  //   }
  // });
  return deferred.promise;
}

function _createOrUpdateRawData(rawData) {
  const deferred = Q.defer();
  RawData.findOneAndUpdate(
    {
      cmd: rawData.cmd,
      status: rawData.status,
      data: rawData.data
    },
    rawData,
    { new: true, upsert: true, setDefaultsOnInsert: true },
    (err, doc) => {
      if (err) deferred.reject(`${err.name} : ${err.message}`);
      deferred.resolve(doc);
    }
  );
  return deferred.promise;
}
