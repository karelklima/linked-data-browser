'use strict';

var _ = require('lodash');
var jwt = require('jsonwebtoken');

var config = require('../../config');
var users = require('../models/users');
var Toaster = require('../lib/toaster');

function createToken(user) {
    return jwt.sign(_.omit(user, 'password'), config.secret, { expiresInMinutes: 60*5 });
}

/**
 * Register a new user
 * @param req
 * @param res
 * @returns {Response|*|{}}
 */
exports.register = function(req, res) {

    req.checkBody('email', 'You must enter a valid email address').isEmail();
    req.checkBody('password', 'Password must be between 2-20 characters long').len(2, 20);
    req.checkBody('passwordConfirm', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();

    if (!errors) {
        errors = [];
    }

    if (!_(errors).find({ param: 'email' })) {
        if (users.findByEmail(req.body.email) !== false) {
            errors = _([{
                param: 'email',
                msg: 'This email address is already registered'
            }]).concat(errors).value();
        }
    }

    var toastr = new Toaster();
    toastr.importValidationErrors(errors);

    if (toastr.size() > 0) {
        return res.status(400).json(toastr.toJSON());
    }

    var userProfile = users.createAccount(req.body.email, req.body.password);
    toastr.success("Registration successful");
    return res.status(201).send({
        toasts: toastr.getToasts(),
        token: createToken(userProfile)
    });

};

/**
 * Logs in an existing user
 * @param req
 * @param res
 * @returns {Response|*|{}}
 */
exports.login = function(req, res) {

    req.checkBody('email', 'You must enter a valid email address').isEmail();
    req.checkBody('password', 'Password must be between 2-20 characters long').len(2, 20);

    var toastr = new Toaster();

    toastr.importValidationErrors(req.validationErrors());
    if (toastr.size() > 0) {
        return res.status(400).json(toastr.toJSON());
    }

    var userProfile = users.authenticate(req.body.email, req.body.password);

    if (!userProfile) {
        toastr.error("The username or password do not match");
        return res.status(401).json(toastr.toJSON());
    }

    toastr.success("Login successful");
    res.status(201).send({
        toasts: toastr.getToasts(),
        token: createToken(userProfile)
    });

};

/**
 * Identity data of current user
 */
exports.me = function(req, res) {

    if (!req.profile || !req.profile.hasOwnProperty('id')) return res.send(null);

    var userData = users.findById(req.profile.id);

    if (userData === false) {
        return res.send(null);
    }

    var id = req.profile.id;

    delete userData.id;
    delete req.profile.id;

    if (_.isEqual(userData, req.profile)) {
        req.profile.id = id;
        return res.json(req.profile);
    }

    var payload = userData;
    var escaped = JSON.stringify(payload);
    escaped = encodeURI(escaped);
    var token = jwt.sign(escaped, config.secret, { expiresInMinutes: 60*5 });
    res.json({ token: token });

};

/**
 * List all users
 */
exports.getAllUsers = function(req, res) {

    var usersData = users.getAll();

    return res.status(200).json(usersData);

};

/**
 * Removes a user
 */
exports.remove = function(req, res) {

    req.checkQuery('id', 'User ID not provided').notEmpty();

    var toaster = new Toaster();

    toaster.importValidationErrors(req.validationErrors());
    if (toaster.size() > 0) {
        return res.status(400).json(toaster.toJSON());
    }

    if (req.query.id == req.user.id) {
        toaster.error('You cannot remove your account');
        return res.status(400).json(toaster.toJSON());
    }

    var userData = users.findById(req.query.id);
    if (!userData) {
        toaster.error('User with given ID not found');
        return res.status(400).json(toaster.toJSON());
    }

    users.removeById(req.query.id);
    toaster.success('User was successfully removed');

    return res.status(200).json(toaster.toJSON());
};

/**
 * Updates a user
 */
exports.update = function(req, res) {

    req.checkBody('id', 'User ID not provided');
    var toaster = new Toaster();

    toaster.importValidationErrors(req.validationErrors());
    if (toaster.size() > 0) {
        return res.status(400).json(toaster.toJSON());
    }

    var params = req.body.params;

    var userData = users.findById(params.id);
    if (!userData) {
        toaster.error('User with given ID not found');
        return res.status(400).json(toaster.toJSON());
    }

    if (params.id == req.user.id && params.roles && params.roles.indexOf('admin') < 0) {
        toaster.error('You cannot revoke your admin privileges');
        return res.status(400).json(toaster.toJSON());
    }

    var id = params.id;
    var data = _.clone(params);
    delete data.id;
    users.updateById(id, data);
    toaster.success('User was successfully updated');

    return res.status(200).json(toaster.toJSON());

};
