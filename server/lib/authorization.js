'use strict';

/**
 * Generic require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {
    if (!req.user) {
        return res.status(401).send('User is not authorized');
    }
    next();
};

/**
 * Generic require Admin routing middleware
 * Basic Role checking - future release with full permission system
 */
exports.requiresAdmin = function(req, res, next) {
    if (!req.user || req.user.roles.indexOf('admin') < 0) {
        return res.status(401).send('User is not authorized');
    }
    next();
};