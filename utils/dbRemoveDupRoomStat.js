// Requires official Node.js MongoDB Driver 3.0.0+
const moment = require('moment');
const chalk = require('chalk');
const mongodb = require('mongodb');

const client = mongodb.MongoClient;
const url = 'mongodb://localhost:27017/';

client.connect(url, (err, client) => {
  const db = client.db('cis_clean');
  const collection = db.collection('roomstats');

  const options = {
    allowDiskUse: false
  };

  const pipeline = [
    {
      $group: {
        _id: {
          _roomId: '$_roomId',
          recordDate: '$recordDate'
        },
        dups: { $push: '$_id' },
        count: { $sum: 1 }
      }
    },
    {
      $match: {
        count: { $gt: 1 }
      }
    }
  ];

  const cursor = collection.aggregate(pipeline, options);

  cursor.forEach(
    (doc) => {
      console.log(doc);
      doc.dups.shift();
      collection.remove(
        { _id: { $in: doc.dups } },
        (error, d) => {
          if (error) console.log(`Error in removing duplicates: ${error}`);
          else {
            console.log(chalk.red(`${d._id} removed.`))}
        }
      );
    },
    (dberr) => {
      console.log(dberr);
      client.close();
    }
  );
});
