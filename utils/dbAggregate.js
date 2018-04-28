// Requires official Node.js MongoDB Driver 3.0.0+
const moment = require('moment');
const chalk = require('chalk');
const mongodb = require('mongodb');

const client = mongodb.MongoClient;
const url = 'mongodb://localhost:27017/';

client.connect(url, (err, client) => {
  const db = client.db('cis_clean');
  const collection = db.collection('roomdatas');

  const options = {
    allowDiskUse: false
  };

  const pipeline = [
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

  const cursor = collection.aggregate(pipeline, options);

  cursor.forEach(
    (doc) => {

      const rEntry = {
        _roomId: doc.room,
        recordDate:  moment(doc.time).format('YYYY-MM-DD'),
        stats: doc.stats.map((e) => {
          return {
            hourRange: moment(e.hourRange).hours(),
            in: e.in,
            out: e.out
          };
        })
      };
      console.log(doc);
      console.log(chalk.yellow(JSON.stringify(rEntry)));    
    },
    (dberr) => {
      console.log(dberr);
      client.close();
    }
  );
});
