var express = require('express');
var router = express.Router();
var userService = require('services/user.service');

// routes
router.post('/authenticate', authenticateUser);
router.post('/register', registerUser);
router.get('/current', getCurrentUser);
router.get('/',getUserList);
router.put('/:_id', updateUser);
router.delete('/:_id', deleteUser);

module.exports = router;

function authenticateUser(req, res) {
    userService.authenticate(req.body.username, req.body.password)
        .then(function (token) {
            if (token) {
                // authentication successful
                res.send({ token: token });
            } else {
                // authentication failed
                res.status(401).send('Username or password is incorrect');
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function registerUser(req, res) {
    userService.create(req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getCurrentUser(req, res) {
    // userService.getById(req.user.sub)
    //     .then(function (user) {
    //         if (user) {
    //             res.send(user);
    //         } else {
    //             res.sendStatus(404);
    //         }
    //     })
    //     .catch(function (err) {
    //         res.status(400).send(err);
    //     });
    res.send(req.session.user);
    console.log("User in session is ");
    console.log(req.session.user);
}

function getUserList(req,res){
    userService.getAll().then(function(userList){
        if(userList){
            res.send(userList);
        }
        else {
            res.sendStatus(404);
        }
    })
    .catch(function(err){
        res.sendStatus(400).send(err);
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
    userService.delete(req.params._id)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}