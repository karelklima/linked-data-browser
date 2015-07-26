'use strict';

var express = require('express');
var _ = require('lodash');

var config = require('../../config');
var assetsController = require('../controllers/assets-controller');

var layouts = require('../models/layouts');
var miniapps = require('../models/miniapps');

module.exports = function(app) {

    app.use(assetsController.injectAssets);

    app.use('/bower_components', express.static('bower_components'));
    app.use('/public', express.static('public'));

    _.forEach(layouts.getAll(), function(layout) {
        var publicDir = 'layouts/' + layout.id + '/public';
        app.use('/' + publicDir, express.static(publicDir));
    });

    _.forEach(miniapps.getAll(), function(miniapp) {
        var publicDir = 'miniapps/' + miniapp.id + '/public';
        app.use('/' + publicDir, express.static(publicDir));
    });

};