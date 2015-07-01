'use strict';

var express = require('express');

var config = require('../../config');
var assetsManager = require('../lib/assets-manager');
var assetsController = require('../controllers/assets-controller');

module.exports = function(app) {

    if (config.env == 'development' && config.aggregate !== true) {

        app.use(assetsController.injectAssets);

        app.use('/bower_components', express.static('bower_components'));
        app.use('/public', express.static('public'));

    }

};