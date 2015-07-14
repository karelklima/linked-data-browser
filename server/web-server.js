var http = require('http');
var fs = require('fs');

// Allow require of .sparql text files containing SPARQL queries
require.extensions['.sparql'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

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

var assetsRoutes = require('./routes/assets-routes');
var configRoutes = require('./routes/config-routes');
var usersRoutes = require('./routes/users-routes');
var endpointsRoutes = require('./routes/endpoints-routes');
var languagesRoutes = require('./routes/languages-routes');
var describeRoutes = require('./routes/describe-routes');
var searchRoutes = require('./routes/search-routes');
var indexRoutes = require('./routes/index-routes');

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

assetsRoutes(app);

configRoutes(app, authorization);

usersRoutes(app, authorization);

endpointsRoutes(app, authorization);

languagesRoutes(app, authorization);

describeRoutes(app, authorization);

searchRoutes(app,  authorization);

// Setup index
indexRoutes(app);

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