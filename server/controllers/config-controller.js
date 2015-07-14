var Toaster = require('../lib/toaster');

var endpoints = require('../models/endpoints');
var languages = require('../models/languages');

/**
 * Presents application configuration
 */
exports.get = function(req, res) {

    try {

        var configData = {
            endpoints: endpoints.getAll(),
            languages: languages.getAll()
        };

        return res.status(200).json(configData);
    }
    catch(e) {
        console.error(e.message);
        console.error(e.stack);
        var toaster = new Toaster();
        toaster.error('Unable to assemble application configuration, please reload the application');
        return res.status(400).json(toaster.toJSON());
    }

};