var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var crc = require('crc');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/',function(req,res){
    res.send('Hello world');
})
var counter = 0;

function crcEncrypt(resultString){
    var buffer = new ArrayBuffer(resultString.length/2);
    var v8 = new Int8Array(buffer);
    var resultArray = resultString.match(/[\w]{2}/g);
    for (var i = 0; i < resultArray.length; i++){
        v8[i] = parseInt(resultArray[i],16);
    }
    return crc.crc16modbus(v8).toString(16).toUpperCase();      
}

var TEST = { 
    cmd: 'getsetting',
    flag: '1B04',
    data: '168E8AFB0300050A00000000000000000000020221455602C7D000351ACB6450CA001EA804B2EFC812010F0F1B0400090012003A9C' 
};


// this function is used to parse time string in the format 'yymmddhhmmss'
function parseTime(timeString){
    var timeArray =  timeString.match(/[\w]{2}/g).map(element => parseInt(element,16));
    console.log(timeArray);
    return new Date(2000+timeArray[0],timeArray[1]-1,timeArray[2],timeArray[3],timeArray[4],timeArray[5]);
}

function genTimeString(date){
    var year = padLeft((date.getYear() - 100).toString(16)).toUpperCase();
    var month = padLeft((date.getMonth() + 1).toString(16)).toUpperCase();
    var day = padLeft(date.getDate().toString(16)).toUpperCase();
    var hour = padLeft(date.getHours().toString(16)).toUpperCase();
    var min = padLeft(date.getMinutes().toString(16)).toUpperCase();
    var sec = padLeft(date.getSeconds().toString(16)).toUpperCase();
    return year + month + day + hour + min + sec; 
}

function padLeft(int){
    return ('00' + int).slice(-2);
}



function parseSetting(data){
    var resultObj = {
        sn: data.slice(0,8).match(/[\w]{2}/g).reverse().join(''),//string
        cmdType: data.slice(8,10),//string
        speed: data.slice(10,12),//string
        recordCycle: parseInt(data.slice(12,14),16),//int
        uploadCycle: parseInt(data.slice(14,16),16),//int
        model: data.slice(34,36),//string
        displayType: data.slice(36,38),//string
        mac1: data.slice(38,50).match(/[\w]{2}/g).join(':'),//string
        signal1: parseInt(data.slice(50,52),16),//int
        mac2: data.slice(52,64).match(/[\w]{2}/g).join(':'),//string
        signal2: parseInt(data.slice(64,66),16),//int
        mac3: data.slice(66,78).match(/[\w]{2}/g).join(':'),//string
        signal3: parseInt(data.slice(78,80),16),//int
        systemTime: parseTime(data.slice(80,92)),//datetime
        systemWeek: parseInt(data.slice(92,94),16),
        openTime: padLeft(parseInt(data.slice(94,96),16)) + padLeft(parseInt(data.slice(96,98),16)),
        closeTime: padLeft(parseInt(data.slice(98,100),16)) + padLeft(parseInt(data.slice(100,102),16)),
        crc: data.slice(-4),
        crcCheck: crcEncrypt(data.slice(0,-4)) == data.slice(-4),
    }
    resultObj.timeCheck = Math.abs(resultObj.systemTime - new Date()) < 60000;
    console.log(resultObj.systemTime);
    console.log(new Date());
    console.log(Math.abs(resultObj.systemTime - new Date()));
    return resultObj
}


app.post('/dataport.aspx',function(req,res){
    console.log('Receive');
    console.log(req.body);
    var cmd = req.body.cmd;
    switch(cmd){
        case 'getsetting':
            var flag = req.body.flag;
            var resFlag = flag.substr(2,2) + flag.substr(0,2);        
            var data = parseSetting(req.body.data);
            if (data.crcCheck){
                console.log('CrcCheck successful');
                res.set('Content-Type','application/x-www-form-urlencoded');                    
                if(data.timeCheck){
                    console.log('Time check successful');
                    var cmdType = '05';//confirm parameters
                }
                else{
                    console.log('Time check failed');
                    var cmdType = '04'//reset parameters
                }
                var recordPeriod = padLeft((10).toString(16).toUpperCase());//default 10
                console.log('Record period is ' + recordPeriod);
                var uploadPeriod = padLeft((120).toString(16).toUpperCase());// default 120
                var openTime = padLeft((10).toString(16).toUpperCase()) + padLeft((0).toString(16).toUpperCase());
                var closeTime = padLeft((20).toString(16).toUpperCase()) + padLeft((30).toString(16).toUpperCase());
                var resultString = cmdType + resFlag + '000000000300' 
                    + recordPeriod + uploadPeriod
                    + '0000000000000000000002000000000000000000000000000000000000000000'
                    + genTimeString(new Date()) + '00' 
                    + openTime + closeTime + '0000';
                res.status(200).send('result=' + resultString + crcEncrypt(resultString));
                console.log(resultString + crcEncrypt(resultString));
                res.end();
            }
            break;
        case 'cache': 
            var flag = req.body.flag;
            var resFlag = flag.substr(2,2) + flag.substr(0,2);        
            
            
            break;
    }
});


var server = app.listen(3000,'0.0.0.0', function () {
    console.log('Server listening at http://' + server.address().address + ':' + server.address().port);
});

