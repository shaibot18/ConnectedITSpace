
var moment = require("moment");
var mongodb = require("mongodb");

var client = mongodb.MongoClient;
var url = "mongodb://192.168.56.103:27017/cis";

client.connect(url, function (err, db) {
    
    var collection = db.collection("roomdatas");

    var cursor = collection.aggregate([{
      $group: {
        _id: { Time: '$Time', In:'$In', Out:'$Out', SN: '$SN' },
        dups: { $push: '$_id' },
        count: { $sum: 1 }
      }
    },
    {
      $match: {
        count: { $gt: 1 }
      }
    }]);
    
    cursor.forEach(
      function(doc) {
          console.log(doc.dups);
          doc.dups.shift(); //keep an item
          collection.remove(
            { _id: { $in: doc.dups } },
            (error) => {
              if (error) db.close();;
            }
          );
          
          },
      function(err) {
          db.close();
      }
  );
});