var config = require('config.json');
var express = require('express');
var router = express.Router();
var roomService = require('services/room.service');
var roomdataService = require('services/roomdata.service');

// routes

router.post('/',addRoomdata);
router.get('/',getRoomdata);

function addRoomdata(req,res){
    console.log('Received post');
    // console.log(req);
    console.log(req.body);
    roomdataService.add(req.body)
    .then(function () {
        res.sendStatus(200);
    })
    .catch(function (err) {
        res.status(400).send(err);
    });
}

function getRoomdata(req,res){
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
}


module.exports = router;