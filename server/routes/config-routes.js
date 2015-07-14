'use strict';

var config = require('../../config');

var configController = require('../controllers/config-controller');

module.exports = function(app, auth) {

    app.route('/api/config')
        .get(configController.get);

};