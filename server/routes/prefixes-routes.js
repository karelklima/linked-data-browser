'use strict';

var prefixesController = require('../controllers/prefixes-controller');

module.exports = function(app, auth) {

    app.use('/api/prefixes', auth.requiresLogin);

    app.route('/api/prefixes')
        .get(prefixesController.get);

};