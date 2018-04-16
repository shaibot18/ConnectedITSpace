const express = require('express');
const moment = require('moment');
const RoomStatService = require('services/room.stat.service');

const router = express.Router();
router.get('/', GetAllStats);
router.get('/:roomId', GetStatsById);
router.get('/:roomId/period', GetStatsByTimeRange);
module.exports = router;

// Get all the rooms
function GetAllStats(req, res) {
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

function GetStatsById(req, res) {
  if (req.params.roomId) {
    const _roomId = req.params.roomId;
    RoomStatService.getAllStatsById(_roomId)
      .then((roomstats) => {
        if (roomstats) {
          res.send(roomstats);
        } else {
          res.sendStatus(404);
        }
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  }
}

function GetStatsByTimeRange(req, res) {
  const query = req.query;
  if (req.params.roomId) {
    if (query.startTime && query.endTime) {
      let start = moment(query.startTime);
      let end = moment(query.endTime);
      if (start.diff(end)>0) {
        let tmp = start;
        start = end;
        end = tmp;
      }
      
      RoomStatService.getStatsByTimeRange(req.params.roomId, start, end)
        .then((roomstats) => {
          if (roomstats) {
            res.send(roomstats);
          } else {
            res.sendStatus(404);
          }
        })
        .catch((err) => {
          res.status(400).send(err);
        });
    }
  }
}