'use strict';

var config = require('../../config');

var searchController = require('../controllers/search-controller');

module.exports = function(app, auth) {

    app.route('/api/search')
        .get(searchController.search);

};