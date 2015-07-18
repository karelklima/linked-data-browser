'use strict';

var Q = require('q');
var _ = require('lodash');

var layouts = require('../models/layouts');
var miniapps = require('../models/miniapps');

function ViewBuilder() {

    function getMiniappMatchInstances(miniapp, resourceGraph) {
        var miniappInstances = [];
        var matchInstances = miniapp.matchInstances(resourceGraph);
        if (_.isArray(matchInstances)) {
            _.forEach(matchInstances, function(instance) {
               miniappInstances.push({
                    miniapp: miniapp.id,
                    instance: instance
                });
            });
        } else if (matchInstances !== null) {
            throw new Error("Invalid match instances recieved, an array or false expected");
        }
        return miniappInstances;
    }

    this.buildRaw = function(resourceGraph) {

        var deferred = Q.defer();

        var viewLayout = layouts.getDefaultLayout();
        var mainPanel = viewLayout.defaultPanel;

        var viewMiniapps = [];

        var setupOrderedMiniapps = _(_.sortBy(miniapps.getRawMiniapps(), 'setupPriority')).reverse().value();

        _.forEach(setupOrderedMiniapps, function(miniapp) {
            _.forEach(getMiniappMatchInstances(miniapp, resourceGraph), function(instance) {
                viewMiniapps.push(instance);
            })
        });

        var panels = { hidden: [] };
        panels[mainPanel] = viewMiniapps;

        resourceGraph.view = {
            type: 'raw',
            layout: viewLayout.id,
            panels: panels
        };

        deferred.resolve(resourceGraph);

        return deferred.promise;

    }

}

var viewBuilder = new ViewBuilder();
module.exports = viewBuilder;