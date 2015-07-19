var _ = require('lodash');
var Q = require('Q');

var endpoints = require('../models/endpoints');
var languages = require('../models/languages');
var layouts = require('../models/layouts');
var miniapps = require('../models/miniapps');

var prefixesManager = require('../lib/prefixes-manager');

/**
 * Presents application configuration
 */
exports.get = function(req, res, next) {

    var prefixesPromises = [];
    _.forEach(endpoints.getAll(), function(endpoint) {
        prefixesPromises.push(prefixesManager.getPrefixes(endpoint)
            .then(function(prefixes) {
                var result = {};
                result[endpoint.alias] = prefixes;
                return result;
            }))
    });

    Q.allSettled(prefixesPromises)
        .then(function (results) {
            var resolved = {};
            results.forEach(function (result) {
                if (result.state === "fulfilled") {
                    _.assign(resolved, result.value);
                } else {
                    var res = result;
                }
            });
            return resolved;
        }).then(function(prefixes) {

            var configData = {
                endpoints: endpoints.getAll(),
                languages: languages.getAll(),
                layouts: layouts.getSetup(),
                miniapps: miniapps.getSetup(),
                prefixes: prefixes
            };

            return res.status(200).json(configData);

        })
        .catch(next)
        .done();


};