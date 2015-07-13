'use strict';

var config = require('../../config');

var endpointsController = require('../controllers/endpoints-controller');

module.exports = function(app, auth) {

    app.use('/api/endpoints', auth.requiresAdmin);

    app.route('/api/endpoints')
        .get(endpointsController.getAll)
        .post(endpointsController.create)
        .put(endpointsController.update)
        .delete(endpointsController.remove);

    app.route('/api/prefixes')
        .get(endpointsController.prefixes);

};