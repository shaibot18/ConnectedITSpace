var express = require('express');
var app = express();

app.get('/',function(req,res){
    res.send('Hello world');
})

app.post('/roomdata',function(req,res){
    console.log('Received post');
    console.log(req.body);
    res.send('Received post');
})

app.get('/roomdata',function(req,res){
    console.log('Received get');
    console.log(req.body);
    res.send('Received get');
})

var server = app.listen(80,"192.168.43.111", function () {
    console.log('Server listening at http://' + server.address().address + ':' + server.address().port);
});

