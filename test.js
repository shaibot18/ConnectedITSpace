var express = require('express');
var app = express();

app.get('/',function(req,res){
    res.send('Hello world');
})

app.post('/dataport.aspx',function(req,res){
    console.log('Received post');
    console.log(req.query);
    console.log(req.originalUrl);
    // console.log(req);
    return res.send('Received post');
})

app.get('/dataport.aspx',function(req,res){
    console.log('Received get');
    console.log(req.body);
    return res.send('Received get');
})

var server = app.listen(1080,'0.0.0.0', function () {
    console.log('Server listening at http://' + server.address().address + ':' + server.address().port);
});

