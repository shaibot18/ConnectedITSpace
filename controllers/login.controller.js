var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('config.json');
var jwt = require('jsonwebtoken');

router.get('/', function (req, res) {
    // log user out
    delete req.session.token;
    delete req.session.user;
    // move success message into local variable so it only appears once (single read)
    var viewData = { success: req.session.success };
    delete req.session.success;
    res.render('login', viewData);
});

router.post('/', function (req, res) {
    // authenticate using api to maintain clean separation between layers
    request.post({
        url: config.apiUrl + '/users/authenticate',
        form: req.body,
        json: true
    }, function (error, response, body) {
        if (error) {
            return res.render('login', { error: 'An error occurred' });
        }

        if (!body.token) {
            return res.render('login', { error: body, username: req.body.username });
        }

        // save JWT token in the session to make it available to the angular app
        // req.session.token = jwt.verify(body.token,config.secret);

        req.session.token = body.token;
        req.session.user = jwt.verify(body.token,config.secret);
        console.log("req.session.user is");
        console.log(req.session.user);
        // var decoded = jwt.verify(body.token,config.secret);
        // console.log(decoded);

        // redirect to returnUrl
        var returnUrl = req.query.returnUrl && decodeURIComponent(req.query.returnUrl) || '/';
        console.log(returnUrl);
        res.redirect(returnUrl);
    });
});

module.exports = router;