require('rootpath')();
const http = require('http');
const chalk = require('chalk');
const mongodb = require('mongodb');
const moment = require('moment');

// db config
const dbclient = mongodb.MongoClient;
const url = 'mongodb://localhost:27017/';

// post config
const hostname = 'localhost';

function generateRequest(data) {
  const postData = JSON.stringify(data);
  const options = {
    hostname,
    port: 3000,
    path: '/api/roomdata',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
  };

  /* eslint-disable */
  const req = http.request(options, (res) => {
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      console.log(`BODY: ${chunk}`);
    });
    res.on('end', () => {
      console.log('No more data in response.');
      console.log(res.body);
    });
  });

  return req;
}


dbclient.connect(url, (err, client) => {

  const db = client.db("cis_clean");
  const collection = db.collection("rawdatas");

  // const query = { "Time": { $gte: moment('2018-04-23') } };
  const query = {};
  const limit = 0;

  const cursor = collection.find(query).limit(limit).toArray((err, items) => {
    if(err){
      console.log(chalk.red(dbErr));
      client.close();
    } else {
      items.forEach((doc, index) => {
        // write to db, delay 200ms
        setTimeout(() => {
          if(doc.cmd === 'cache'){
            const obj = {
              cmd: doc.cmd,
              flag: doc.flag,
              status: doc.status,
              data: doc.data
            };
            const reqObj = generateRequest(obj);
            reqObj.on('error', (e) => {
              console.error(`problem with request: ${e.message}`);
            });

            // write data to request body
            reqObj.write(JSON.stringify(obj));
            reqObj.end();
            console.log(chalk.yellow(index) + chalk.green(' inject.'))
          } 
        }, 200 * index);
      });
    }
  });
});

