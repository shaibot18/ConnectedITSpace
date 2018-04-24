const config = require('config');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Q = require('q');
const mongoose = require('services/dbConnection.service'); // pack mongoose connection into one module

const Schema = mongoose.Schema;
const userSchema = new Schema({
  username: String,
  firstName: String,
  lastName: String,
  department: String,
  role: String,
  email: String,
  hash: String,
  rooms: []
});
const User = mongoose.model('User', userSchema);
const service = {};
service.authenticate = authenticate;
service.getById = getById;
service.getAll = getAll;
service.create = create;
service.update = update;
service.delete = _delete;

module.exports = service;

function authenticate(username, password) {
  const deferred = Q.defer();
  User.findOne({
    username
  }, (err, user) => {
    if (err) deferred.reject(err.name + ': ' + err.message);
    if (user && bcrypt.compareSync(password, user.hash)) {
      // authentication successful
      deferred.resolve(jwt.sign({
        sub: user._id,
        role: user.role,
        firstName: user.firstName
      }, config.secret));
    } else {
      // authentication failed
      deferred.resolve();
    }
  });

  return deferred.promise;
}

function getById(_id) {
  var deferred = Q.defer();

  User.findById(_id, function (err, user) {
    if (err) deferred.reject(err.name + ': ' + err.message);

    if (user) {
      // return user (without hashed password)
      deferred.resolve(_.omit(user, 'hash'));
    } else {
      // user not found
      deferred.resolve();
    }
  });

  return deferred.promise;
}

function getAll() {
  var deferred = Q.defer();
  User.find({}, function (err, userList) {
    if (err) deferred.reject(err.name + ': ' + err.message);

    if (userList) {
      deferred.resolve(userList);
    } else {
      // user not found
      deferred.resolve();
    }
  });

  return deferred.promise;
}

function create(userParam) {
  var deferred = Q.defer();
  console.log(userParam);
  // validation

  User.find({
    username: userParam.username
  }, function (err, userList) {
    if (err) deferred.reject(err.name + ': ' + err.message);
    if (userList.length > 0) {
      // username already exists
      deferred.reject('Username "' + userParam.username + '" is already taken');
    } else {
      createUser();
    }
  });

  function createUser() {
    // set user object to userParam without the cleartext password
    var user = new User(_.omit(userParam, 'password'));
    // add hashed password to user object
    user.hash = bcrypt.hashSync(userParam.password, 10);
    user.save(function (err, user) {
      if (err) deferred.reject(err.name + ': ' + err.message);
      deferred.resolve();
    });
  }

  return deferred.promise;
}

function update(_id, userParam) {
  var deferred = Q.defer();

  // validation
  User.findById(_id, function (err, user) {
    if (err) deferred.reject(err.name + ': ' + err.message);

    if (user.username !== userParam.username) {
      // username has changed so check if the new username is already taken
      User.findOne({
          username: userParam.username
        },
        function (err, user) {
          if (err) deferred.reject(err.name + ': ' + err.message);

          if (user) {
            // username already exists
            deferred.reject('Username "' + req.body.username + '" is already taken')
          } else {
            updateUser();
          }
        });
    } else {
      updateUser();
    }
  });

  function updateUser() {
    // fields to update
    var set = {
      firstName: userParam.firstName,
      lastName: userParam.lastName,
      username: userParam.username,
    };

    // update password if it was entered
    if (userParam.password) {
      set.hash = bcrypt.hashSync(userParam.password, 10);
    }

    User.update({
        _id: mongo.helper.toObjectID(_id)
      }, {
        $set: set
      },
      function (err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        deferred.resolve();
      });
  }

  return deferred.promise;
}

function _delete(_id) {
  var deferred = Q.defer();

  User.remove({
      _id: _id
    },
    function (err) {
      if (err) deferred.reject(err.name + ': ' + err.message);
      deferred.resolve();
    });
  return deferred.promise;
}