'use strict';

var Q = require('q');
var _ = require('lodash');

var layouts = require('../models/layouts');
var MiniappsResolver = require('../lib/miniapps-resolver');
var views = require('../models/views');

function ViewBuilder() {

    function resolveActiveInstances(view, activeInstances) {
        var presentInstances = [];
        view = _.cloneDeep(view);
        _.forEach(_.keys(view.panels), function(panelKey) {
            view.panels[panelKey] = _.filter(view.panels[panelKey], function(miniappInstance) {
                var present = false;
                _.forEach(activeInstances, function(activeInstance) {
                    if (_.isEqual(activeInstance, miniappInstance)) {
                        present = true;
                        return false; // exit loop
                    }
                });
                if (present) {
                    presentInstances.push(miniappInstance);
                }
                return present;
            });
        });

        if (view.strictMode != true) {
            var layout = layouts.getById(view.layout);
            var defaultPanel = view.panels[layout.defaultPanel];
            _.forEach(activeInstances, function(activeInstance) {
                var present = false;
                _.forEach(presentInstances, function(presentInstance) {
                    if (_.isEqual(activeInstance, presentInstance)) {
                        present = true;
                        return false; // exit loop
                    }
                });
                if (!present) {
                    defaultPanel.push(activeInstance);
                }
            });
        }
        return view;
    }

    function buildCustomView(graph, activeInstances) {
        var matchedViews = [];
        _.forEach(views.getAll(), function(view) {
            var sat = _.every(view.matchingRules, function(rule) {
                if (rule.property == '@id') {
                    return graph['@id'] == rule.equals;
                }
                if (rule.property == '@type') {
                    return !_.isUndefined(_.find(graph['@type'], { '@id': rule.includes }));
                }
                if (rule.mode == 'exists') {
                    return !_.isUndefined(_.find(graph['property'], { '@id': rule.property, 'relation': rule.relation }));
                }
                if (rule.mode == 'type') {
                    var property = _.find(graph['property'], { '@id': rule.property, 'relation': rule.relation });
                    return _.any(property.data, function(object) {
                        return !_.isUndefined(_.find(object['@type'], { '@id': rule.includes }));
                    });
                }
                return false; // invalid rule
            });
            if (sat) {
                matchedViews.push(view);
            }
        });
        matchedViews = _(_.sortBy(matchedViews, 'matchingPriority')).reverse().value();
        return matchedViews.length > 0 ? resolveActiveInstances(matchedViews[0], activeInstances) : false;
    }

    function buildView(graph, miniappsInstances) {

        var viewLayout = layouts.getDefaultLayout();
        var mainPanel = viewLayout.defaultPanel;

        var panels = { inactive: [] };
        panels[mainPanel] = miniappsInstances;

        return {
            layout: viewLayout.id,
            panels: panels
        };

    }

    this.buildRaw = function(resourceGraph) {
        var resourceGraphObject = resourceGraph['@graph'][0];
        var miniappsResolver = new MiniappsResolver(resourceGraphObject);
        resourceGraphObject['viewRaw'] = buildView(resourceGraphObject, miniappsResolver.resolveRaw());
        return resourceGraph;
    };

    this.buildFormatted = function(resourceGraph) {
        var resourceGraphObject = resourceGraph['@graph'][0];
        var miniappsResolver = new MiniappsResolver(resourceGraphObject);
        var activeInstances = miniappsResolver.resolve();
        var view = buildCustomView(resourceGraphObject, activeInstances);
        if (!view) {
            view = buildView(resourceGraphObject, activeInstances);
        }
        resourceGraphObject['viewFormatted'] = view;
        return resourceGraph;
    };

    this.buildEdit = function(resourceGraph) {
        var resourceGraphObject = resourceGraph['@graph'][0];
        var miniappsResolver = new MiniappsResolver(resourceGraphObject);
        resourceGraphObject['viewDefault'] = buildView(resourceGraphObject, miniappsResolver.resolve());
        resourceGraphObject['viewCustom'] = buildCustomView(resourceGraphObject, miniappsResolver.resolve());

        return resourceGraph;
    }

}

var viewBuilder = new ViewBuilder();
module.exports = viewBuilder;