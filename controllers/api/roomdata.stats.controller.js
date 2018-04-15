const express = require('express');
const RoomStatService = require('services/room.stat.service');

const router = express.Router();
router.get('/', GetAll);
module.exports = router;

// Get all the rooms
function GetAll(req, res) {
  RoomStatService.getAllStats()
    .then((stats) => {
      if (stats) {
        res.send(stats);
      } else {
        res.sendStatus(404);
      }
    })
    .catch((err) => { res.status(400).send(err); });
}
