const express = require('express');
const moment = require('moment');
const _ = require('underscore');
const RoomStatService = require('services/room.stat.service');

const router = express.Router();

router.get('/', GetAllStats);
router.get('/:roomId', GetAllStatsById);
router.get('/:roomId/:date', GetRoomStatsByIdDate);
router.get('/:roomId/period', getRoomStatsByDateRange);
router.post('/:roomId', manipulateRoomStats);
module.exports = router;

// Get all stats of all rooms
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

// Get all stats of a single room identified by id
function GetAllStatsById(req, res) {
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

function GetRoomStatsByIdDate(req, res) {
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

function getRoomStatsByDateRange(req, res) {
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


function getRoomStatsByDateRange(req, res) {
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


/**
 * 
 * @param {req} request received
 * @param {res} response sent
 * This function provides entry points for handlers for each command
 */
function manipulateRoomStats(req, res){
  const obj = req.body;

  let cmdRes = {};

  switch(obj.cmd){
    case 'query':
      _queryRoomStatHandler(obj).then((result) => {
        res.code(result.code).send(result);
      });
      break;
    case 'inject':
      cmdRes = _injectRoomStatHandler(obj).then((result) => {
        res.code(result.code).send(result);
      });
      break;
    case 'generate':
      cmdRes = _generateRoomStatHandler(obj).then((result) => {
        res.code(result.code).send(result);
      });
      break;
    case 'delete':
      cmdRes = _deleteRoomStatHandler(obj).then((result) => {
        res.code(result.code).send(result);
      });
      break;
    default:break;
  }
}

/**
 * 
 * @param {obj} request object
 * {
 * cmd: 'query',
 * roomId: 'id',
 * startDate: '2018-04-08',
 * endDate: '2018-04-10'
 * }
 */
function _queryRoomStatHandler(obj){

  const startDate = obj.startDate;
  const endDate = obj.endDate;
  const roomId = obj.roomId;

  let start = moment(startDate);
  let end = moment(endDate);

  if(!end || start.diff(end)==0){
    RoomStatService.getStatsByDate(roomId, start)
    .then((roomstats) => {
      if (roomstats) {
        return {
          code: '200',
          data: roomstats
        };
      } else {
        return {
          code: 404,
          data: 'No content'
        };
      }
    })
    .catch((err) => {
      return {
        code: 400,
        data: err
      };
    });
  }
  else if (start.diff(end)>0) {
    let tmp = start;
    start = end;
    end = tmp;

    RoomStatService.getStatsByTimeRange(roomId, start, end)
    .then((roomstats) => {
      if (roomstats) {
        return {
          code: '200',
          data: roomstats
        };
      } else {
        return {
          code: 404,
          data: 'No content'
        };
      }
    })
    .catch((err) => {
      return {
        code: 400,
        data: err
      };
    });
  }
}

/**
 * 
 * @param {obj} request object
 * {
 * cmd: 'inject',
 * roomId: 'id',
 * tz: 'tz',
 * data: [
 *  {
 *    date: '2018-04-08',
 *    records: [
 *                {hour:0, in: 0, out: 0}
 *              ]
*   },
 * ]
 * }
 */
function _injectRoomStatHandler(obj){

  const roomId = obj.roomId;
  const tz = obj.tz;
  
  obj.data.forEach(element => {
    let record = {
      _roomId: roomId,
      recordDate: element.date,
      recordTimeZone: tz,
      stats: element.records
    };

    RoomStatService.createOrUpdateRoomStatEntry(record);
    
  });
}

/**
 * 
 * @param {obj} request object
 * {
 * cmd: 'generate',
 * roomId: 'id',
 * startDate: '2018-04-08',
 * endDate: '2018-04-10'
 * }
 */
function _generateRoomStatHandler(obj){
  
}

/**
 * 
 * @param {obj} request object
 * {
 * cmd: 'delete',
 * roomId: 'id',
 * startDate: '2018-04-08',
 * endDate: '2018-04-10'
 * }
 */
function _deleteRoomStatHandler(obj){
  
}

