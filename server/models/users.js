'use strict';

var crypto = require('crypto');

var _ = require('lodash');
var low = require('lowdb');
var underscoreDb = require('underscore-db');

var config = require('../../config');



function Users() {
    var usersDatabase = low(config.datastore + '/users.json');
    usersDatabase._.mixin(underscoreDb);
    var users = usersDatabase('users');

    var hash = crypto.createHash('sha1');

    if (users.size() < 1) {
        createAdminAccount();
    }

    function createAdminAccount() {
        var admin = config.defaultAdminAccount;
        users.insert({
            email: admin.email,
            password: hashPassword(admin.password),
            roles: 'user admin'
        });
    }

    function hashPassword(password) {
        return crypto.createHash('sha1').update(password).digest('hex');
    }

    function findOne(spec) {
        var user = users.find(spec);
        if (_.isObject(user)) {
            var output = _.clone(user);
            delete output.password; // do not propagate user password hash
            return output;
        }
        return false;
    }

    this.authenticate = function(email, password) {
        return findOne({
            email: email,
            password: hashPassword(password)
        });
    };

    this.findByEmail = function(email) {
        return findOne({
            email: email
        });
    };

    this.findById = function(id) {
        return findOne({
            id: id
        });
    };

    this.createAccount = function(email, password) {
        users.insert({
            email: email,
            password: hashPassword(password),
            roles: 'user'
        });
        return findOne({
            email: email
        });
    };

    this.getAll = function() {
        return users.map(function(o) { return _.omit(o, 'password'); });
    };

    this.removeById = function(id) {
        return users.removeById(id);
    };

    this.updateById = function(id, data) {
        return users.updateById(id, data);
    };

}

var users = new Users();
module.exports = users;