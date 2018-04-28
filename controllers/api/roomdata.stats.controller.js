const express = require('express');
const moment = require('moment');
const RoomStatService = require('services/room.stat.service');
const mongoose = require('services/dbConnection.service');
const RoomDataService = require('services/roomdata.service');
const chalk = require('chalk');

const router = express.Router();

router.get('/:roomId', getAllStatsById);
router.get('/:roomId/:date', getRoomStatsByIdDate);
router.get('/:roomId/period', getRoomStatsByDateRange);
router.post('/', manipulateRoomStats);
module.exports = router;

// Get all stats of a single room identified by id
function getAllStatsById(req, res) {
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

function getRoomStatsByIdDate(req, res) {
  if (req.params.roomId) {
    if (req.params.date) {
      const roomId = req.params.roomId;
      const qDate = moment(req.params.date).format('YYYY-MM-DD');
      _queryByIdDate(roomId, qDate, res);
    }
  }
}

function _queryByIdDate(roomId, qDate, res) {
  RoomStatService.getStatsByIdDate(roomId, qDate)
    .then((result) => {
      if (result) {
        res.send(result);
      } else {
        res.sendStatus(200).send({ code: 404, msg: 'No records found' });
      }
    })
    .catch((err) => {
      res.status(400).send(err);
    });
}

function getRoomStatsByDateRange(req, res) {
  const query = req.query;
  if (req.params.roomId) {
    if (query.startTime && query.endTime) {
      _queryByDateRange(query.startTime, query.endTime, req.params.roomId, res);
    }
  }
}

function _queryByDateRange(startDate, endDate, roomId, res) {
  let start = moment(startDate);
  let end = moment(endDate);
  if (start.diff(end) > 0) {
    const tmp = start;
    start = end;
    end = tmp;
  }
  RoomStatService.getStatsByTimeRange(roomId, start, end)
    .then((roomstats) => {
      if (roomstats) {
        res.send(roomstats);
      } else {
        res.sendStatus(200).send({ code: 404, msg: 'No records found' });
      }
    })
    .catch((err) => {
      res.status(400).send(err);
    });
}

/**
 * @param {req} request received
 * @param {res} response sent
 * This function provides entry points for handlers for each command
 */
function manipulateRoomStats(req, res) {
  const obj = req.body;
  console.log(chalk.yellow(JSON.stringify(obj))); // eslint-disable-line no-console

  switch (obj.cmd) {
    case 'query':
      _queryRoomStatHandler(req, res);
      break;
    case 'inject':
      _injectRoomStatHandler(req, res);
      break;
    case 'generate':
      _generateRoomStatHandler(req, res);
      break;
    case 'delete':
      _deleteRoomStatHandler(req, res);
      break;
    default:
      res.status(400).send('No cmd body.');
      break;
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
function _queryRoomStatHandler(req, res) {
  const queryObj = req.body;

  if (typeof queryObj.endDate === 'undefined') { // single date query
    _queryByIdDate(queryObj.roomId, moment(queryObj.startDate), res);
  } else { // date range query
    _queryByDateRange(queryObj.startDate, queryObj.endDate, queryObj.roomId, res);
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
 *                {hourRange:0, in: 0, out: 0, accu: 10}
 *              ]
*   },
 * ]
 * }
 */
function _injectRoomStatHandler(req, res) {
  const roomId = req.body.roomId;
  const tz = req.body.tz;

  req.body.data.forEach((e) => {
    const record = {
      _roomId: roomId,
      recordDate: e.date,
      recordTimeZone: tz,
      stats: e.records
    };

    RoomStatService.createOrUpdateRoomStatEntry(record)
      .then((roomstats) => {
        if (roomstats) {
          res.send(roomstats);
        } else {
          res.sendStatus(200).send({ code: 404, msg: 'No records injected' });
        }
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  });
}

/**
 *
 * @param {obj} request object
 * {
 * cmd: 'generate',
 * src: [db|random],
 * roomId: 'id',
 * startDate: '2018-04-08',
 * endDate: '2018-04-10'
 * }
 */
function _generateRoomStatHandler(req, res) {

  if (req.body.force === 'f') {
    mongoose.connection.db.dropCollection('roomstats', (dberr) => {
      if (dberr) {
        console.log(chalk.red(`Error dropping collection, no housekeeping done. \n ${dberr}`)); // eslint-disable-line no-console
      } else {
        _runHouseKeep(res);
      }
    });
  }
  else {
    _runHouseKeep(res);
  }
}

function _runHouseKeep(res) {
  RoomStatService.roomStatHouseKeep()
    .then((roomstats) => {
      if (roomstats) {
        res.sendStatus(200).send({ code: 200, msg: 'House clean' });
      } else {
        res.sendStatus(200).send({ code: 404, msg: 'No records injected' });
      }
    })
    .catch((err) => {
      res.status(400).send(err);
    });
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
function _deleteRoomStatHandler(req, res) {
  const queryObj = req.body;

  if (typeof queryObj.endDate === 'undefined') { // single date query
    __deleteByDate(queryObj.roomId, moment(queryObj.startDate), res);
  } else { // date range query
    __deleteByDateRange(queryObj.roomId, queryObj.startDate, queryObj.endDate, res);
  }
}

function __deleteByDate(roomId, date, res) {
  RoomStatService.deleteRoomStatsEntry(roomId, moment(date))
    .then((queryResult) => {
      if (queryResult.n > 0) {
        res.status(200).send({ code: 200, msg: `${queryResult.result.n} records removed.` });
      } else {
        res.status(200).send({ code: 200, msg: 'No records removed.' });
      }
    })
    .catch((err) => {
      res.status(400).send(err);
    });
}

function __deleteByDateRange(roomId, startDate, endDate, res) {
  let start = moment(startDate);
  let end = moment(endDate);
  if (start.diff(end) > 0) {
    const tmp = start;
    start = end;
    end = tmp;
  }

  RoomStatService.deleteRoomStatsEntryByDateRange(roomId, start, end)
    .then((queryResult) => {
      if (queryResult.result.n > 0) {
        res.status(200).send({ code: 200, msg: `${queryResult.result.n} records removed.` });
      } else {
        res.status(200).send({ code: 200, msg: 'No records removed.' });
      }
    })
    .catch((err) => {
      res.status(400).send(err);
    });
}
