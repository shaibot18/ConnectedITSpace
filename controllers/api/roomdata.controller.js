var config = require('config.json');
var express = require('express');
var router = express.Router();
var roomService = require('services/room.service');
var roomdataService = require('services/roomdata.service');

// routes

router.post('/',add);
router.get('/:roomId',getByTimeRange);
//router.get('/',get);

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