'use strict';

var config = require('./index');

var compression = require('compression');
var morgan = require('morgan');
var consolidate = require('consolidate');
var express = require('express');
var helpers = require('view-helpers');
var flash = require('connect-flash');
var modRewrite = require('connect-modrewrite');

module.exports = function(app) {

    app.set('showStackError', true);

    // Prettify HTML
    app.locals.pretty = true;

    // cache=memory or swig dies in NODE_ENV=production
    app.locals.cache = 'memory';

    app.use(compression({
        // Maximum compression
        level: 9
    }));

    // Setup logging
    if (config.logging !== false) {
        var configLogging = config.logging || {};

        var format  = configLogging.format || 'dev';
        var options = configLogging.options || {};

        app.use(morgan(format, options));
    }

    // assign the template engine to .html files
    app.engine('html', consolidate[config.templateEngine]);

    // Set .html as the default extension to apply the template engine on
    app.set('view engine', 'html');

    // Dynamic helpers
    // TODO remove???
    app.use(helpers(config.app.name));

    // Flash messages support
    app.use(flash());

    app.use(modRewrite([

        '!^/api/.*|\\.html|\\.js|\\.css|\\.swf|\\.jp(e?)g|\\.png|\\.gif|\\.svg|\\.eot|\\.ttf|\\.woff|\\.pdf$ / [L]'

    ]));

};
