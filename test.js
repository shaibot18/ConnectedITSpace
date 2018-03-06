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

app.post('/dataport.aspx',function(req,res){
    console.log('Receive');
    console.log(req.body);
    var flag = req.body.flag;
    var buffer = new ArrayBuffer(56);
    var v8 = new Int8Array(buffer);
    var resFlag = flag.substr(2,2) + flag.substr(0,2); 
    if (counter == 0){
        var resultString = "04" + resFlag + "0000000003000A780000000000000000000002000000000000000000000000000000000000000000110305111126000A00141E0000";
    }
    else{
        var resultString = "05" + resFlag + "0000000003000A780000000000000000000002000000000000000000000000000000000000000000110305111126000A00141E0000";        
    }
    // var f1 = parseInt(flag.substr(0,2),16);
    // var f2 = parseInt(flag.substr(2,2),16);
    var resultArray = resultString.match(/[\w]{2}/g);
    for (var i = 0; i < resultArray.length; i++){
        v8[i] = parseInt(resultArray[i],16);
    }
    var crcCheck = crc.crc16modbus(v8).toString(16).toUpperCase();  
    res.set('Content-Type','application/x-www-form-urlencoded');    
    // res.status(200).send(new Buffer('result=' + resultString + crcCheck));
    res.status(200).send('result=' + resultString + crcCheck);
    res.end();
    counter = counter + 1;
    console.log('Response is');
    console.log('result=' + resultString + crcCheck);    
})


var server = app.listen(3000,'0.0.0.0', function () {
    console.log('Server listening at http://' + server.address().address + ':' + server.address().port);
});

