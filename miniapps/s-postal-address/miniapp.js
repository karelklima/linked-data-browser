var _ = require('lodash');

module.exports = {

    description: 'Default subject relation display',

    matchInstances: function(resourceGraph) {
        var instances = [];
        _.forEach(resourceGraph.property, function (property) {
            if (_.includes(property.sampleTypes, "http://schema.org/PostalAddress")) {
                instances.push({
                    property: property['@id'],
                    relation: property['relation']
                });
            }
        });
        return instances;
    },

    inhibitInstances: function(resourceGraph) {
        var generalInstances = [];
        _.forEach(resourceGraph.property, function (property) {
            if (_.includes(property.sampleTypes, "http://schema.org/PostalAddress")) {
                generalInstances.push({
                    property: property['@id'],
                    relation: property['relation']
                });
            }
        });
        return [{
            miniapp: '*',
            instances: generalInstances
        }];
    },

    displayPriority: 100,
    setupPriority: 0

};