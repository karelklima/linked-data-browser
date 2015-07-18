'use strict';

var ToasterError = require('./toaster-error');

/**
 * Generic require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {
    if (!req.user) {
        throw new ToasterError('User is not authorized', 401);
    }
    next();
};

/**
 * Generic require Admin routing middleware
 * Basic Role checking - future release with full permission system
 */
exports.requiresAdmin = function(req, res, next) {
    if (!req.user || req.user.roles.indexOf('admin') < 0) {
        throw new ToasterError('User is not authorized', 401);
    }
    next();
};