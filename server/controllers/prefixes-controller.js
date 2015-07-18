var Toaster = require('../lib/toaster');

var prefixesManager = require('../lib/prefixes-manager');
var fs = require('fs');

/**
 * Presents application configuration
 */
exports.get = function(req, res) {


    var error =        new Error('Asynchronous error from timeout');
    console.log(error);


    var x = {};
    var f = x.x.throwBall();

    /*try {

        var configData = {
            endpoints: endpoints.getAll(),
            languages: languages.getAll(),
            layouts: layouts.getSetup(),
            miniapps: miniapps.getSetup()
        };

        return res.status(200).json(configData);
    }
    catch(e) {
        console.error(e.message);
        console.error(e.stack);
        var toaster = new Toaster();
        toaster.error('Unable to assemble application configuration, please reload the application');
        return res.status(400).json(toaster.toJSON());
    }*/

};