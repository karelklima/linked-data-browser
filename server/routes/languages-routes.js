'use strict';

var config = require('../../config');

var languagesController = require('../controllers/languages-controller');

module.exports = function(app, auth) {

    app.use('/api/languages', auth.requiresAdmin);

    app.route('/api/languages')
        .get(languagesController.getAll)
        .post(languagesController.create)
        .put(languagesController.update)
        .delete(languagesController.remove);


};