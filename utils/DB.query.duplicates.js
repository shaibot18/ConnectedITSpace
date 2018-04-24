
var moment = require("moment");
var mongodb = require("mongodb");

var client = mongodb.MongoClient;
var url = "mongodb://192.168.56.103:27017/cis";

client.connect(url, function (err, db) {
    
    var collection = db.collection("roomdatas");

    var query = {
      "Time": {
        "$gte": moment("2018-03-15 00:00:00.000+08:00").toDate(),
        "$lt": moment("2018-03-16 00:00:00.000+08:00").toDate()
      }
  };
  
  var cursor = collection.find(query);
  
  cursor.forEach(
      function(doc) {
        // console.log(doc["_id"], doc["Time"]);
          doc.Time += 24 * 3600 * 1000;
          collection.save(doc);
      },
      function(err) {
          db.close();
      }
  );

});