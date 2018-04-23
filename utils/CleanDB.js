require('rootpath')();
const DBService = require('services/db.service');

DBService.removeDuplicates();
DBService.adjustTimeZone();
