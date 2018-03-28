const express = require('express');
const roomService = require('services/room.service');

const router = express.Router();
router.post('/', Create);
router.get('/:_id', Get);
router.put('/:_id', Update);
router.delete('/:_id', Delete);
router.get('/roomlist/:_id', getRoomList);
router.get('/roomlist/', getAll);
module.exports = router;

function Update(req, res) {
  roomService.Update(req.params._id, req.body)
    .then((room) => { res.status(200).send(room); })
    .catch((err) => { res.status(400).send(err); });
}
function Get(req, res) {
  roomService.get(req.params._id)
    .then((room) => {
      if (room) {
        res.send(room);
      }
    })
    .catch((err) => { res.status(400).send(err); });
}

function Create(req, res) {
  roomService.create(req.body)
    .then(() => { res.sendStatus(200); })
    .catch((err) => { res.status(400).send(err); });
}

function Delete(req, res) {
  const roomId = req.params._id;
  roomService.delete(roomId)
    .then(() => {
      res.sendStatus(200);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
}

function getRoomList(req, res) {
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

function getAll(req, res) {
  roomService.getAll()
    .then((roomList) => {
      if (roomList) {
        res.send(roomList);
      } else {
        res.sendStatus(404);
      }
    })
    .catch((err) => { res.status(400).send(err); });
}
