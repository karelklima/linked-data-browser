var http = require('http');
var fs = require('fs');

var express = require('express');
var cookieParser = require('cookie-parser');
var expressValidator = require('express-validator');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var errorHandler = require('errorhandler');
var passport = require('passport');
var expressJwt = require('express-jwt');

var config = require('../config');
var expressConfig = require('../config/express');

var assetsRouter = require('./routers/assets-router');

var app = express();

// Setup views directory
app.set('views', config.root + '/server/views');

// Setup basics
app.use(cookieParser());
app.use(expressValidator());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(methodOverride());



// Setup authentication and authorization
app.use('/api', expressJwt({
    secret: config.secret,
    credentialsRequired: false
}), function(req, res, next) {
    if (req.user) req.user = JSON.parse(decodeURI(req.user));
    next();
});

app.use(passport.initialize());
app.use(passport.session());

expressConfig(app);

assetsRouter(app);

// Setup index
app.get('/', function(req, res){
    res.render('index');
});

// Internal server error or 404
app.use(function (err, req, res, next) {
    // 404
    if (~err.message.indexOf('not found')) return next();

    console.error(err.stack);
res.status(500).render('500', {
        error: err.stack
    });
});

// Error 404
app.use(function(req, res) {
    res.status(404).render('404', {
        url: req.originalUrl,
        error: 'Not found'
    });
});

// Setup error handler
if (process.env.NODE_ENV === 'development') {
    app.use(errorHandler());
}

var httpServer = http.createServer(app);
httpServer.listen(config.http ? config.http.port : config.port);