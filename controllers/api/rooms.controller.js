var config = require('config.json');
var express = require('express');
var router = express.Router();
var roomService = require('services/room.service');

// routes
router.post('/',create);
router.get('/current', getCurrentUser);
router.put('/:_id', updateUser);
router.delete('/:_id', deleteUser);
router.get('/roomlist/:_id',getRoomList);

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

function getCurrentUser(req, res) {
    userService.getById(req.user.sub)
        .then(function (user) {
            if (user) {
                res.send(user);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
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

function deleteUser(req, res) {
    var userId = req.user.sub;
    if (req.params._id !== userId) {
        // can only delete own account
        return res.status(401).send('You can only delete your own account');
    }

    userService.delete(userId)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}