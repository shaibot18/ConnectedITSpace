const express = require('express');
const roomService = require('services/room.service');
const RoomDataService = require('services/roomdata.service');

const router = express.Router();
router.get('/', GetAll);
router.post('/', Create);
router.get('/:_id', Get);
router.put('/:_id', Update);
router.delete('/:_id', Delete);
router.get('/roomlist/:_id', GetRoomList);
module.exports = router;

function Update(req, res) {
  roomService.Update(req.params._id, req.body)
    .then((room) => { res.status(200).send(room); })
    .catch((err) => { res.status(400).send(err); });
}

function Get(req, res) {
  if (req.params._id) {
    roomService.Get(req.params._id)
      .then((room) => {
        if (room) {
          res.send(room);
        }
      })
      .catch((err) => { res.status(400).send(err); });
  }
}

function Create(req, res) {
  roomService.create(req.body)
    .then(() => { res.sendStatus(200); })
    .catch((err) => { res.status(400).send(err); });
}

// Delete room including its data
function Delete(req, res) {
  const roomId = req.params._id;
  const deleteRoom = roomService.delete(roomId);
  const deleteRoomData = RoomDataService.DeleteRoomData(roomId);
  Promise.all([deleteRoom, deleteRoomData])
    .then(() => {
      res.sendStatus(200);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
}

function GetRoomList(req, res) {
  roomService.getByUserId(req.params._id)
    .then((roomList) => {
      if (roomList) {
        res.send(roomList);
      } else {
        res.sendStatus(404);
      }
    })
    .catch((err) => { res.status(400).send(err); });
}

// Get all the rooms
function GetAll(req, res) {
  roomService.GetAll()
    .then((roomList) => {
      if (roomList) {
        res.send(roomList);
      } else {
        res.sendStatus(404);
      }
    })
    .catch((err) => { res.status(400).send(err); });
}
