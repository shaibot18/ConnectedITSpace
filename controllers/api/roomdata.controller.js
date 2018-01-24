var bodyParser = require('body-parser');
var config = require('config.json');
var express = require('express');
var router = express.Router();
var crc = require('crc');
var roomService = require('services/room.service');
var roomdataService = require('services/roomdata.service');
// router.use(bodyParser.json()); // support json encoded bodies
// router.use(bodyParser.urlencoded({ extended: true }));

var openTime = padLeft((10).toString(16).toUpperCase()) + padLeft((0).toString(16).toUpperCase());
var closeTime = padLeft((20).toString(16).toUpperCase()) + padLeft((30).toString(16).toUpperCase());

// routes
// router.post('/',add);
router.get('/:roomId',getByTimeRange);
router.post('/',function(req,res){
    console.log('Receive');
    console.log(req.body);
    let cmd = req.body.cmd;
    res.set('Content-Type','application/x-www-form-urlencoded');                        
    let systemTimeWeek = genTimeString(new Date()) + '00';            
    let flag = req.body.flag;
    let resFlag = flag.substr(2,2) + flag.substr(0,2);
    let data,cmdType;    
    switch(cmd){
        case 'getsetting':
            data = parseSetting(req.body.data);
            if (data.crcCheck){
                console.log('CrcCheck successful');
                if(data.timeCheck){
                    console.log('Time check successful');
                    cmdType = '05';//confirm parameters
                }
                else{
                    console.log('Time check failed');
                    cmdType = '04'//reset parameters
                }
                let recordPeriod = padLeft((2).toString(16).toUpperCase());//default 10
                let uploadPeriod = padLeft((4).toString(16).toUpperCase());// default 120, 0 for real-time
                let resultString = cmdType + resFlag + '000000000300' 
                    + recordPeriod + uploadPeriod
                    + '0000000000000000000002000000000000000000000000000000000000000000'
                    + systemTimeWeek + openTime + closeTime + '0000';
                res.status(200).send('result=' + resultString + crcEncrypt(resultString));
                console.log('Result string is ' + resultString + crcEncrypt(resultString));
                res.end();
            }
            break;
        case 'cache': 
            data = parseData(req.body);
            console.log(data);
            let resType;
            if(data.err) {
                console.log(data.err);
                resType = '02';//data uploading check failed     
            }
            else {
                console.log('CrcCheck successful');                
                resType = '01';//data uploading check successful 
            }
            cmdType = '03';//check both system time and open/close time 
            let resultString = resType + resFlag + cmdType + systemTimeWeek + openTime + closeTime;
            res.status(200).send('result=' + resultString + crcEncrypt(resultString));
            res.end();                
            break;
    }
});
//router.get('/',get);

function padLeft(){
    let string = arguments[0];
    if (arguments[1]){
        let nOfBytes = arguments[1];
        return ('0000' + string).slice((-2)*nOfBytes);
    }
    return ('00' + string).slice(-2);
}

function crcEncrypt(resultString){
    let buffer = new ArrayBuffer(resultString.length/2);
    let v8 = new Int8Array(buffer);
    let resultArray = resultString.match(/[\w]{2}/g);
    for (var i = 0; i < resultArray.length; i++){
        v8[i] = parseInt(resultArray[i],16);
    }
    return padLeft(crc.crc16modbus(v8).toString(16).toUpperCase(),2);      
}

// this function is used to parse time string in the format 'yymmddhhmmss'
function parseTime(timeString){
    let timeArray =  timeString.match(/[\w]{2}/g).map(element => parseInt(element,16));
    return new Date(2000+timeArray[0],timeArray[1]-1,timeArray[2],timeArray[3],timeArray[4],timeArray[5]);
}

function genTimeString(date){
    let year = padLeft((date.getYear() - 100).toString(16)).toUpperCase();
    let month = padLeft((date.getMonth() + 1).toString(16)).toUpperCase();
    let day = padLeft(date.getDate().toString(16)).toUpperCase();
    let hour = padLeft(date.getHours().toString(16)).toUpperCase();
    let min = padLeft(date.getMinutes().toString(16)).toUpperCase();
    let sec = padLeft(date.getSeconds().toString(16)).toUpperCase();
    return year + month + day + hour + min + sec; 
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
    return resultObj
}


function parseData(body){
    let status = body.status; 
    let data = typeof body.data == 'string'? [body.data]:body.data; 
    let resultObj = {};
    resultObj.data = [];
    if (status.length != 28){
        return {err: 'Status length is not valid'}
    }
    if (crcEncrypt(status.slice(0,-4)) != status.slice(-4)){
        return {err: 'Status CrcCheck failed' + status}        
    }
    
    for (let i = 0; i < data.length; i++){
        let cur = data[i];
        if(cur.length != 34){
            return {err: 'Data length is not valid' + data[i]}
        }
        if (cur.slice(-4) != crcEncrypt(cur.slice(0,-4))){
            return {err: 'Data CrcCheck failed' + cur}                                
        }
        resultObj.data.push({
            time: parseTime(cur.slice(0,12)),//datetime
            in: parseInt(cur.slice(14,22).match(/[\w]{2}/g).reverse().join(''),16),
            out: parseInt(cur.slice(22,30).match(/[\w]{2}/g).reverse().join(''),16),            
        })
    }
    resultObj.status =  {
        version: status.slice(0,4),
        sn: status.slice(4,12).match(/[\w]{2}/g).reverse().join(''),
        focus: status.slice(12,14) == '00',//'00' for normal '01' for failure
        voltage: parseInt(status.slice(16,18) + status.slice(14,16),16) / 1000,
        battery: parseInt(status.slice(18,20),16),
        charged: status.slice(-8,-4) == '0000',
    };
    return resultObj;
}




function add(req,res){
    // console.log('Received post');
    // console.log(req);
    // console.log(req.body);
    roomdataService.add(req.body)
    .then(function () {
        res.sendStatus(200);
    })
    .catch(function (err) {
        res.status(400).send(err);
    });
}

function getByTimeRange(req,res){
    var query = req.query;
    if(req.params.roomId){
        if(query.startTime && query.endTime){
            roomdataService.getByTimeRange(req.params.roomId,parseInt(query.startTime),parseInt(query.endTime))
                .then(function(roomdataList){
                    if(roomdataList){
                        res.send(roomdataList);
                    }
                    else{
                        res.sendStatus(404);
                    }
                })
                .catch(function (err) {
                    res.status(400).send(err);
                });
            return;             
        }
    }
}

function get(req,res){
    var query = req.query;
    if (JSON.stringify(query) == "{}"){
        roomdataService.getAll()
            .then(function(roomdataList){
                if(roomdataList){
                    res.send(roomdataList);
                }
                else{
                    res.sendStatus(404);
                }
            })
            .catch(function (err) {
                res.status(400).send(err);
            });  
        return
    }
    else{
        res.sendStatus(404).send({
            error: "Unsupported query"
        });
    }
}


module.exports = router;