require('rootpath')();
const UtilService = require('services/util.service');
const http = require('http');
const moment = require('moment');
const chalk = require('chalk');

const timeDiff = 8 * 60 * 60 * 1000;
const hostname = 'localhost';
// const hostname = 'https://cis.apps.sg1.bosch-iot-cloud.com';
// const hostname = '54.223.122.184';
// const SN = 'AAAAAAAA';
const SN = 'FB8A8E16';
// const SN = 'JFKD1101';

/**
 * format is [{obj},[]]
 * obj = {
 * date: 'date',
 * data: [data]}
 * 
 * data = [hour, in, out]
 */
/* const rawData = [
  {
    date: '2018-04-02',
    data: [[13, 19, 18], [14, 22, 21], [15, 16, 17], [16, 14, 13], [17, 10, 11]]
  },
  {
    date: '2018-04-12',
    data: [[9, 16, 15], [10, 20, 18], [11, 15, 17], [12, 3, 4], [13, 26, 16], [14, 18, 20], [15, 16, 19], [16, 10, 12], [17, 12, 15]]
  },
  {
    date: '2018-04-13',
    data: [[9, 14, 13], [10, 22, 21], [11, 18, 16], [12, 1, 1], [13, 31, 27], [14, 25, 26], [15, 18, 20], [16, 12, 12], [17, 7, 9]]
  },
  {
    date: '2018-04-16',
    data: [[9, 10, 11], [10, 18, 11], [11, 17, 15], [12, 1, 2], [13, 19, 20], [14, 24, 19], [15, 22, 23], [16, 17, 15], [17, 8, 11]]
  },
  {
    date: '2018-04-17',
    data: [[9, 14, 14], [10, 19, 18], [11, 18, 20], [12, 3, 2], [13, 19, 18], [14, 22, 23], [15, 17, 17], [16, 16, 15], [17, 10, 10]]
  },
  {
    date: '2018-04-18',
    data: [[9, 10, 11], [10, 18, 16], [11, 16, 14], [14, 15, 11], [15, 23, 22], [16, 18, 16], [17, 12, 11]]
  },
  {
    date: '2018-04-19',
    data: [[9, 17, 15], [10, 18, 16], [11, 16, 15], [12, 3, 1], [13, 20, 19], [14, 22, 20], [15, 18, 14], [16, 15, 10], [17, 11, 7]]
  },
  {
    date: '2018-04-23',
    data: [[9, 12, 12], [10, 21, 23], [11, 19, 17], [12, 2, 3], [13, 23, 21], [14, 21, 19], [15, 24, 26], [16, 16, 17], [17, 7, 9]]
  },
  {
    date: '2018-04-24',
    data: [[14, 18, 16], [15, 20, 20], [16, 19, 17], [17, 13, 11]]
  },
  {
    date: '2018-04-25',
    data: [[11, 14, 11], [12, 2, 3], [13, 16, 15], [14, 18, 17], [15, 16, 17], [16, 14, 8], [17, 8, 10]]
  },
  {
    date: '2018-04-26',
    data: [[9, 14, 11], [10, 16, 14], [11, 15, 14], [12, 2, 1], [13, 18, 16], [14, 19, 17], [15, 16, 18], [16, 12, 11], [17, 6, 8]]
  }
]; */

const rawData = [
  {
    date: '2018-04-24',
    data: [[14, 14, 12], [15, 16, 15], [16, 15, 13], [17, 10, 8]]
  }
];

const generatedData = [];

function dataGenerator(rDate, rHour, inCounter, outCounter) {
  const date = new Date(rDate);
  const year = padLeft((date.getYear() - 100).toString(16)).toUpperCase();
  const month = padLeft((date.getMonth() + 1).toString(16)).toUpperCase();
  const day = padLeft(date.getDate().toString(16)).toUpperCase();
  const hour = padLeft(rHour.toString(16)).toUpperCase();
  const min = padLeft(Math.floor(Math.random()*60).toString(16)).toUpperCase();
  const sec = padLeft(Math.floor(Math.random() * 60).toString(16)).toUpperCase();
  const focus = '00';
  const inText = padLeft(inCounter.toString(16)).toUpperCase().concat('000000');
  const outText = padLeft(outCounter.toString(16)).toUpperCase().concat('000000');
  const resultString = year + month + day + hour + min + sec + focus + inText + outText;
  console.log(chalk.yellow(`${parseInt(year, 16)}-${parseInt(month, 16)}-${parseInt(day, 16)} ${parseInt(hour, 16)}:${parseInt(min, 16)}:${parseInt(sec, 16)} => ${resultString} => ${crcEncrypt(resultString)}`));
  return resultString.concat(crcEncrypt(resultString));
}

function generateStatus() {
  const resultString = '0101'.concat(SN.match(/[\w]{2}/g).reverse().join(''))
    .concat('00F60C0D0001');
  return resultString.concat(crcEncrypt(resultString));
}

const padLeft = UtilService.padLeft;
const crcEncrypt = UtilService.crcEncrypt;

rawData.forEach((ele) => {
  ele.data.forEach((e) => {
    generatedData.push(dataGenerator(ele.date, e[0], e[1], e[2]));
  });
});

const testData = {
  cmd: 'cache',
  flag: '3617',
  status: generateStatus(),
  data: generatedData,
  count: '0002',
  temp: 'C3B',
  Tend: 'nnnnnnnnnnnnnnnnnnT'
};

const postData = JSON.stringify(testData);
const options = {
  hostname,
  port: 3000,
  path: '/api/roomdata',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};
const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
  res.on('end', () => {
    console.log('No more data in response.');
    console.log(res.body);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

// write data to request body
req.write(postData);
req.end();
