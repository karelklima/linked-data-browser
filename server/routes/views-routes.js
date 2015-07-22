'use strict';

var config = require('../../config');

var viewsController = require('../controllers/views-controller');

module.exports = function(app, auth) {

    app.use('/api/views', auth.requiresAdmin);

    app.route('/api/views')
        .get(viewsController.getAll)
        .post(viewsController.create)
        .put(viewsController.update)
        .delete(viewsController.remove);

};