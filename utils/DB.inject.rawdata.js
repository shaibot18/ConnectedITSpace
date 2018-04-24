
var moment = require("moment");
var mongodb = require("mongodb");

var client = mongodb.MongoClient;
var url = "mongodb://192.168.56.103:27017/cis";

client.connect(url, function (err, db) {
    
    var collection = db.collection("roomdatas");
    var raw_collection = db.collection("rawdatas");

    var cursor = raw_collection.find({});
    
    let index = 0;

    cursor.forEach(
      function(doc) {
          if(doc.cmd === 'cache'){
            const dataList = (typeof doc.data === 'string') ? [doc.data] : doc.data;
            const resType = '01'; // data uploading check successful
            cmdType = '03'; // check both system time and open/close time
            for (let i = 0; i < dataList.length; i++) {
              const cur = dataList[i];
              if (cur.length !== 34) {
                console.log(`Data ${cur} length is not valid`);
              }else{
                let tArr = cur.slice(0, 12).match(/[\w]{2}/g).map(element => parseInt(element, 16));
                let tM = moment(tArr.join[' ', 'YY M DD HH mm ss Z']).toDate();
                console.log(tM);
                const dataObj = {
                  SN: 'FB8A8E16',
                  In: parseInt(cur.slice(14, 22).match(/[\w]{2}/g).reverse().join(''), 16),
                  Out: parseInt(cur.slice(22, 30).match(/[\w]{2}/g).reverse().join(''), 16),
                  _RoomId: '5aa8c731bfd9f7000e140d2d',
                  TimeZone: '+0800',
                  Time: tM // datetime
                };
                
                setTimeout(function () {
                  collection.save(dataObj);
                  // console.log(dataObj);
                  console.log(`${index++} data processed and saved.`);
                }, 200);
              }
            }
          }
        },
      function(err) {
          db.close();
      }
  );
});