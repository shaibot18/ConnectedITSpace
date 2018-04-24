const express = require('express');
const chalk = require('chalk');
const jwt = require('jsonwebtoken');
const request = require('request');
const config = require('config');

const router = express.Router();

// const baseApiUrl = process.env.PORT ? config.apiUrl : config.localUrl;
// console.log(baseApiUrl);

// TODO: Apply user timeout function
router.get('/', (req, res) => {
  // log user out
  delete req.session.token;
  delete req.session.user;
  // move success message into local variable so it only appears once (single read)
  const viewData = {
    success: req.session.success
  };
  delete req.session.success;
  res.render('login', viewData);
});

router.post('/', (req, res) => {

  // authenticate using api to maintain clean separation between layers
  request.post({
    url: `${req.protocol}://${req.get('host')}/api/users/authenticate`,
    form: req.body,
    json: true
  }, (error, response, body) => {
    if (error) {
      console.log(error);
      return res.render('login', { error });
    }

    if (!body.token) {
      return res.render('login', {
        error: body,
        username: req.body.username
      });
    }
    // save JWT token in the session to make it available to the angular app
    // req.session.token = jwt.verify(body.token,config.secret);
    req.session.token = body.token;
    req.session.user = jwt.verify(body.token, config.secret);
    // console.log('req.session.user is');
    // console.log(req.session.user);
    // var decoded = jwt.verify(body.token,config.secret);
    // console.log(decoded);
    // redirect to returnUrl
    const returnUrl = req.query.returnUrl && decodeURIComponent(req.query.returnUrl) || '/';
    // console.log(returnUrl);
    res.redirect(returnUrl);
  });
});

module.exports = router;
