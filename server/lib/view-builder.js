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

    function buildCustomView(resourceGraph) {
        return false; // TODO
    }

    function buildView(resourceGraphObject, miniapps) {

        var viewLayout = layouts.getDefaultLayout();
        var mainPanel = viewLayout.defaultPanel;

        var viewMiniapps = [];

        var setupOrderedMiniapps = _(_.sortBy(miniapps, 'setupPriority')).value();

        _.forEach(setupOrderedMiniapps, function(miniapp) {
            var matchedInstances = miniapp.matchInstances(resourceGraphObject);

            if (matchedInstances !== false && !_.isArray(matchedInstances)) {
                throw new Error("Invalid match instances recieved, an array or false expected");
            } else if (_.isArray(matchedInstances)) {
                viewMiniapps.push({
                    miniapp: miniapp.id,
                    displayPriority: miniapp.displayPriority,
                    instances: matchedInstances
                });
            }

            var inhibitedInstances = miniapp.inhibitInstances(resourceGraphObject);
            if (inhibitedInstances !== false && !_.isArray(inhibitedInstances)) {
                throw new Error("Invalid inhibit instances recieved, an array or false expected");
            } else if (_.isArray(inhibitedInstances)) {
                _.forEach(inhibitedInstances, function(miniappInstances) {
                    if (_.isUndefined(miniappInstances.miniapp)) {
                        throw new Error("Invalid inhibit instance recieved, a miniapp field expected");
                    } else if (miniappInstances.instances !== false && !_.isArray(miniappInstances.instances)) {
                        throw new Error("Invalid inhibit instance recieved, a instances field expected to be false or an array");
                    } else if (_.isArray(miniappInstances.instances)) {
                        var target = _.find(viewMiniapps, { miniapp: miniappInstances.miniapp });
                        if (target) {
                            _.forEach(miniappInstances.instances, function (inhibitedInstance) {
                                var targetInstance = _.find(target.instances, inhibitedInstance);
                                if (targetInstance) {
                                    _.remove(target.instances, targetInstance);
                                }
                            });
                        }
                    }
                 });
            }

        });

        viewMiniapps = _(_.sortBy(viewMiniapps, 'displayPriority')).reverse().value();
        var finalOrderedMiniapps = _([]).concat(_.map(viewMiniapps, function(miniapp) {
            return miniapp.instances;
        })).value();

        var compactedViewMiniapps = [];
        _.forEach(viewMiniapps, function(miniapp) {
            _.forEach(miniapp.instances, function(instance) {
                compactedViewMiniapps.push({
                    miniapp: miniapp.miniapp,
                    instance: instance
                })
            })
        });


        var panels = { inactive: [] };
        panels[mainPanel] = compactedViewMiniapps;

        return {
            layout: viewLayout.id,
            panels: panels
        };

    }

    this.buildRaw = function(resourceGraph) {
        var resourceGraphObject = resourceGraph['@graph'][0];
        resourceGraphObject['viewRaw'] = buildView(resourceGraphObject, miniapps.getRawMiniapps());
        return resourceGraph;
    };

    this.buildFormatted = function(resourceGraph) {
        var resourceGraphObject = resourceGraph['@graph'][0];
        // TODO
        resourceGraphObject['viewFormatted'] = buildView(resourceGraphObject, miniapps.getNotRawMiniapps());
        return resourceGraph;
    };

    this.buildEdit = function(resourceGraph) {
        var resourceGraphObject = resourceGraph['@graph'][0];
        resourceGraphObject['viewDefault'] = buildView(resourceGraphObject, miniapps.getNotRawMiniapps());
        resourceGraphObject['viewCustom'] = buildCustomView(resourceGraphObject);

        return resourceGraph;
    }

}

var viewBuilder = new ViewBuilder();
module.exports = viewBuilder;