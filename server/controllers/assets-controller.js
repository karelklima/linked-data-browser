'use strict';

var _ = require('lodash');

var assetsManager = require('../lib/assets-manager');

exports.injectAssets = function(req, res, next) {

    res.locals.assets = {
        css: _(assetsManager.getCssAssets()).concat(assetsManager.getExternalCssAssets()).value(),
        js: _(assetsManager.getJsAssets()).concat(assetsManager.getExternalJsAssets()).value(),
        jsFooter: _(assetsManager.getJsFooterAssets()).concat(assetsManager.getExternalJsFooterAssets()).value()
    };
    next();
};