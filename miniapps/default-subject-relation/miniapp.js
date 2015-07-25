var _ = require('lodash');

module.exports = {

    description: 'Default subject relation display',

    matchInstances: function(resourceGraph) {
        var instances = [];
        _.forEach(resourceGraph.property, function (property) {
            if (property.relation == 'subject') {
                instances.push({
                    property: property['@id'],
                    relation: property['relation']
                });
            }
        });
        return instances;
    },

    displayPriority: 100,
    setupPriority: -1000

};