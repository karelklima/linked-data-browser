'use strict';

var assert = require('assert');
var fs = require('fs');
var glob = require('glob');
var _ =  require('lodash');

var config = require('../../config');

function Layouts() {

    var layouts = [];
    var layoutsSetup= [];
    var defaultLayout = null;

    scanLayouts();

    function scanLayouts() {
        var layoutsDir = config.root + '/layouts/';
        var dirs = glob.sync(layoutsDir + '*');
        _.forEach(dirs, function(dir) {
            if (!fs.lstatSync(dir).isDirectory()) {
                return; // not a layout
            }
            var layout = _.clone(require(dir + '/layout.js'));

            layout.id = dir.substring(layoutsDir.length);
            layout = _.defaults(layout, {
                displayTemplate: 'display.html',
                setupTemplate: 'setup.html'
            });

            assert(!_.isEmpty(layout.name), 'Layout ' + layout.id + ': name must not be empty');
            assert(!_.isEmpty(layout.displayTemplate), 'Layout ' + layout.id + ': displayTemplate must not be empty');
            var displayTemplate = dir + '/public/views/' + layout.displayTemplate;
            assert(fs.existsSync(displayTemplate), 'Layout ' + layout.id + ': displayTemplate does not exists: ' + displayTemplate);
            assert(!_.isEmpty(layout.setupTemplate), 'Layout ' + layout.id + ': setupTemplate must not be empty');
            var setupTemplate = dir + '/public/views/' + layout.setupTemplate;
            assert(fs.existsSync(setupTemplate), 'Layout ' + layout.id + ': setupTemplate does not exists: ' + setupTemplate);
            assert(!_.isEmpty(layout.defaultPanel), 'Layout ' + layout.id + ': defaultPanel must not be empty');
            assert(_.isArray(layout.panels), 'Layout ' + layout.id + ': blocks must be an array');
            assert(_.contains(layout.panels, layout.defaultPanel), 'Layout ' + layout.id + ': panels does not contain the defaultPanel');

            layout.displayTemplate = '/layouts/' + layout.id + '/public/views/' + layout.displayTemplate; // use absolute path
            layout.setupTemplate = '/layouts/' + layout.id + '/public/views/' + layout.setupTemplate;

            layouts.push(layout);
            layoutsSetup.push(layout);
            if (config.defaultLayout == layout.id) {
                defaultLayout = layout;
                layout.default = true;
            } else {
                layout.default = false;
            }
        });
        if (defaultLayout == null) {
            throw new Error('Invalid default layout specified');
        }
    }

    this.getAll = function() {
        return layouts;
    };

    this.getSetup = function() {
        return layoutsSetup;
    };

    this.getDefaultLayout = function() {
        return defaultLayout;
    }

}

var layouts = new Layouts();
module.exports = layouts;