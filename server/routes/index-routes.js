'use strict';

var express = require('express');

var config = require('../../config');
var assetsManager = require('../lib/assets-manager');
var indexController = require('../controllers/index-controller');

module.exports = function(app) {

    app.route('/').get(indexController.render);

};