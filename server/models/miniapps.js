'use strict';

var assert = require('assert');
var fs = require('fs');
var glob = require('glob');
var _ =  require('lodash');

var config = require('../../config');

function Miniapps() {

    var miniapps = [];
    var miniappsSetup = [];

    scanMiniapps();

    function scanMiniapps() {
        var miniappsDir = config.root + '/miniapps/';
        var dirs = glob.sync(miniappsDir + '*');
        _.forEach(dirs, function(dir) {
            if (!fs.lstatSync(dir).isDirectory()) {
                return; // not a miniapp
            }
            var miniapp = _.clone(require(dir + '/miniapp.js'));
            miniapp.id = dir.substring(miniappsDir.length);
            miniapp = _.defaults(miniapp, {
                raw: false,
                inhibitInstances: function(resourceGraph) {
                    return [];
                },
                setupApplication: function(app, auth) {
                    return;
                },
                displayTemplate: 'display.html',
                setupTemplate: 'setup.html',
                displayPriority: 0,
                setupPriority: 0
            });

            assert(!_.isEmpty(miniapp.description), 'Miniapp ' + miniapp.id + ': description must not be empty');
            assert(!_.isEmpty(miniapp.displayTemplate), 'Miniapp ' + miniapp.id + ': displayTemplate must not be empty');
            var displayTemplate = dir + '/public/views/' + miniapp.displayTemplate;
            assert(fs.existsSync(displayTemplate), 'Miniapp ' + miniapp.id + ': displayTemplate does not exists: ' + displayTemplate);
            assert(!_.isEmpty(miniapp.setupTemplate), 'Miniapp ' + miniapp.id + ': setupTemplate must not be empty');
            var setupTemplate = dir + '/public/views/' + miniapp.setupTemplate;
            assert(fs.existsSync(setupTemplate), 'Miniapp ' + miniapp.id + ': setupTemplate does not exists: ' + setupTemplate);
            assert(_.isBoolean(miniapp.raw), 'Miniapp ' + miniapp.id + ': a raw parameter missing or not a boolean');
            assert(_.isFunction(miniapp.matchInstances), 'Miniapp ' + miniapp.id + ': a matchInstances parameter missing or not a function');
            assert(_.isFunction(miniapp.inhibitInstances), 'Miniapp ' + miniapp.id + ': a inhibitInstances parameter missing or not a function');

            miniapp.displayTemplate = '/miniapps/' + miniapp.id + '/public/views/' + miniapp.displayTemplate; // use absolute path
            miniapp.setupTemplate = '/miniapps/' + miniapp.id + '/public/views/' + miniapp.setupTemplate;

            miniapps.push(miniapp);
            miniappsSetup.push({
                id: miniapp.id,
                description: miniapp.description,
                displayTemplate: miniapp.displayTemplate,
                setupTemplate: miniapp.setupTemplate,
                displayPriority: miniapp.displayPriority,
                setupPriority: miniapp.setupPriority,
                raw: miniapp.raw
            });
        });
    }

    this.getAll = function() {
        return miniapps;
    };

    this.getById = function(id) {
        var result = _.find(miniapps, { id: id });
        return _.isUndefined(result) ? false : result;
    };

    this.getSetup = function() {
        return miniappsSetup;
    };

}

var miniapps = new Miniapps();
module.exports = miniapps;