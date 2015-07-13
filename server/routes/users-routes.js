'use strict';

var config = require('../../config');

var usersController = require('../controllers/users-controller');

module.exports = function(app, auth) {

    // Setting up the users api
    app.route('/api/register')
        .post(usersController.register);

    app.route('/api/login')
        .post(usersController.login);

    app.route('/api/me')
        .get(usersController.me);

    app.use('/api/users', auth.requiresAdmin);

    app.route('/api/users')
        .get(usersController.getAllUsers)
        .put(usersController.update)
        .delete(usersController.remove);

};