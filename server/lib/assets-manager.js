'use strict';

var path = require('path');
var glob = require('glob');
var assert = require('assert');
var _ = require('lodash');

var config = require('../../config');
var bowerComponents = require('../../config/bower-components');

function AssetsManager() {

    var baseDir = config.root;
    var assets = [];

    scanAssets();

    function scanAssets() {
        scanBowerComponents();
        scanApplicationComponents();
    }

    function scanBowerComponents() {
        var iterator = 1000;
        _.forEach(bowerComponents.css, function(cssFile) {
            addAsset(true, false, 'css', cssFile, iterator--);
        });
        iterator = 1000;
        _.forEach(bowerComponents.js, function(jsFile) {
            addAsset(false, false, 'js', jsFile, iterator--);
        });
    }

    function scanApplicationComponents() {
        var cssFiles = glob.sync(baseDir + '/public/assets/**/*.css');
        var iterator = 500;
        _.forEach(cssFiles, function(cssFile) {
            addAsset(true, false, 'css', cssFile, iterator--);
        });
        var jsFiles = glob.sync(baseDir + '/public/**/*.js');
        iterator = 500;
        _.forEach(jsFiles, function(jsFile) {
            addAsset(false, false, 'js', jsFile, iterator--);
        });
    }

    /**
     * Adds an asset to the collection
     * @param header {boolean}
     * @param external {boolean}
     * @param type {String} 'js' or 'css'
     * @param path {String} path or URL
     * @param weight {Number} higher is more important
     */
    function addAsset(header, external, type, path, weight) {

        assert(_.isBoolean(header));
        assert(_.isBoolean(external));
        assert(type === 'js' || type == 'css');
        assert(_.isString(path));

        var url;
        if (!external) {
            url = pathToUrl(path);
        } else {
            url = path;
        }

        if (_.isNull(weight)) {
            weight = 0;
        } else {
            assert(_.isNumber(weight));
        }

        assets.push({
            header: !!header,
            external: !!external,
            type: type,
            url: url,
            path: path,
            weight: weight
        })
    }

    /**
     * Returns a list of all assets of defined properties
     * @param header {boolean}
     * @param external {boolean}
     * @param type {String} 'js' or 'css'
     */
    function getAssets(header, external, type) {
        assert(_.isBoolean(header));
        assert(_.isBoolean(external));
        assert(type === 'js' || type == 'css');

        return _(assets).filter({
            header: header,
            external: external,
            type: type
        }).sortBy('weight').reverse().value();
    }

    /**
     * Converts a file path to a URL
     * @param filePath {String}
     * @returns {String}
     */
    function pathToUrl(filePath) {
        filePath = path.normalize(filePath);
        if (_.startsWith(filePath, baseDir)) {
            filePath = filePath.substring(baseDir.length);
        }
        return filePath.replace(/\\/g,"/");
    }

    // helpers for adding assets
    this.addCssAsset = addAsset.bind(null, true, false, 'css');
    this.addExternalCssAsset = addAsset.bind(null, true, true, 'css');
    this.addJsAsset = addAsset.bind(null, true, false, 'js');
    this.addExternalJsAsset = addAsset.bind(null, true, true, 'js');
    this.addJsFooterAsset = addAsset.bind(null, false, false, 'js');
    this.addExternalJsFooterAsset = addAsset.bind(null, false, true, 'js');

    // helpers for getting assets
    this.getCssAssets = getAssets.bind(null, true, false, 'css');
    this.getExternalCssAssets = getAssets.bind(null, true, true, 'css');
    this.getJsAssets = getAssets.bind(null, true, false, 'js');
    this.getExternalJsAssets = getAssets.bind(null, true, true, 'js');
    this.getJsFooterAssets = getAssets.bind(null, false, false, 'js');
    this.getExternalJsFooterAssets = getAssets.bind(null, false, true, 'js');

}

var assetManager = new AssetsManager();
module.exports = assetManager;