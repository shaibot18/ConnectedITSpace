var moment = require("moment");
var mongodb = require("mongodb");

var client = mongodb.MongoClient;
var url = "mongodb://192.168.56.103:27017/cis";

client.connect(url, function (err, db) {
    
    var collection = db.collection("roomdatas");
    
    var query = {
        "Time": {
            "$gte": moment("2018-04-14").toDate(),
            "$lt": moment("2018-04-22").toDate()
        }
    };
    
    var sort = [ ["Time", 1] ];
    
    var cursor = collection.find(query).sort(sort);
    
    cursor.forEach(
        function(doc) {
            console.log(doc["_id", "Time"]);
            doc.Time -= 8 * 3600 * 1000;
            collection.save(doc);
            },
        function(err) {
            db.close();
        }
    );
});