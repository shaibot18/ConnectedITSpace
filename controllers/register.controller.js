const express = require('express');
const request = require('request');
// const config = require('config.json');

const router = express.Router();

// var baseApiUrl = process.env.PORT? config.apiUrl:config.localUrl;
// console.log(baseApiUrl);

router.get('/', (req, res) => {
  res.render('register');
});

router.post('/', (req, res) => {
  // register using api to maintain clean separation between layers
  request.post({
    url: `${req.headers.host}/users/register`,
    form: req.body,
    json: true
  }, (error, response, body) => {
    if (error) {
      console.log(error);
      return res.render('register', { error: error });
    }

    if (response.statusCode !== 200) {
      return res.render('register', {
        error: response.body,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username
      });
    }

    // return to login page with success message
    req.session.success = 'Registration successful';
    return res.redirect('/login');
  });
});

module.exports = router;
