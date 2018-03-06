var express = require('express');
var router = express.Router();
var roomService = require('services/room.service');

// routes
router.post('/',create);
router.delete('/:_id', _delete);
router.get('/roomlist/:_id', getRoomList);
router.get('/roomlist/', getAll);

module.exports = router;

function create(req,res){
    roomService.create(req.body)
        .then(function(){
            res.sendStatus(200);
        })
        .catch(function(err){
            res.status(400).send(err);
        });
}

function _delete(req, res) {
    var roomId = req.params._id;

    roomService.delete(roomId)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getRoomList(req,res){
    roomService.getByUserId(req.params._id)
        .then(function(roomList){
            if(roomList){
                res.send(roomList);
            } else{
                res.sendStatus(404);
            }
        })
        .catch(function(err){
            res.status(400).send(err);            
        });
}

function getAll(req,res){
    roomService.getAll()
        .then(function(roomList){
            if(roomList){
                res.send(roomList);
            } else{
                res.sendStatus(404);
            }
        })
        .catch(function(err){
            res.status(400).send(err);            
        });
}

function updateUser(req, res) {
    var userId = req.user.sub;
    if (req.params._id !== userId) {
        // can only update own account
        return res.status(401).send('You can only update your own account');
    }

    userService.update(userId, req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

