require('rootpath')();
const express = require('express');

const app = express();
const session = require('express-session');
const bodyParser = require('body-parser');
// const expressJwt = require('express-jwt');
const config = require('config.json');
// const crc = require('crc');
function unless(path, middleware) {
  return function (req, res, next) {
        if (path === req.path) {
            return next();
        } else {
            return middleware(req, res, next);
        }
    }
};

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(unless('/api/roomdata',session({ secret: config.secret, resave: false, saveUninitialized: true })));
app.use(express.static(__dirname+'/public'));

// use JWT auth to secure the api
// app.use('/api', expressJwt({ secret: config.secret }).unless({ path: ['/api/users/authenticate', '/api/users/register'] }));
// routes
app.use('/login', require('./controllers/login.controller'));
app.use('/register', require('./controllers/register.controller'));
app.use('/app', require('./controllers/app.controller'));
app.use('/api/users', require('./controllers/api/users.controller'));
app.use('/api/rooms', require('./controllers/api/rooms.controller'));
app.use('/api/roomdata', require('./controllers/api/roomdata.controller'));

// make '/app' default route
app.get('/', function (req, res) {
    return res.redirect('/app');
});

app.post('/',function(req,res){
    console.log(req.body);
    return res.send('received post');
});

// start server
if (process.env.PORT){
    var server = app.listen(process.env.PORT, function () {
        console.log('Server listening at http://' + server.address().address + ':' + server.address().port);
    });
}
else {
    var server = app.listen(3000, '0.0.0.0', function () {
        console.log('Server listening at http://' + server.address().address + ':' + server.address().port);
    });
}
