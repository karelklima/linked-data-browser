var _ = require('lodash');

module.exports = {

    name: 'Raw display',
    raw: true,

    matchInstances: function(resourceGraph) {
        var instances = [];

        instances.push({ special: '@id' });

        instances.push({ special: '@type' });

        _.forEach(resourceGraph.property, function(property) {
            instances.push({ relation: property.relation, property: property['@id'] });
        });

        return instances;
    },

    displayTemplate: 'display.html',
    setupTemplate: 'setup.html',

    displayPriority: 0,
    setupPriority: -100

};