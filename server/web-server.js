var http = require('http');
var fs = require('fs');

var express = require('express');
var cookieParser = require('cookie-parser');
var expressValidator = require('express-validator');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var errorHandler = require('errorhandler');
var expressJwt = require('express-jwt');
var cors = require('cors');

var config = require('../config');
var expressConfig = require('../config/express');
var authorization = require('./lib/authorization');

var assetsRouter = require('./routes/assets-routes');
var usersRouter = require('./routes/users-routes');
var indexRouter = require('./routes/index-routes');

var app = express();

// Setup views directory
app.set('views', config.root + '/server/views');

// Setup basics
app.use(cookieParser());
app.use(expressValidator());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(methodOverride());

// Setup authentication and authorization
app.use('/api', expressJwt({
    secret: config.secret,
    credentialsRequired: false
}), function(req, res, next) {
    if (req.profile) req.profile = JSON.parse(decodeURI(req.profile));
    next();
});

expressConfig(app);

assetsRouter(app);

usersRouter(app, authorization);

// Setup index
indexRouter(app);

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