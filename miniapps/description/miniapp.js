var _ = require('lodash');

function descriptionMatchInstances(resourceGraph) {
    var instances = [];
    if (_.find(resourceGraph.property, { '@id': 'http://purl.org/dc/terms/description', 'relation': 'subject' })) {
        return [{ property: 'http://purl.org/dc/terms/description', relation: 'subject'}];
    }
    return instances;
}

module.exports = {

    description: 'Description display - dcterms:description',

    matchInstances: descriptionMatchInstances,

    inhibitInstances: function(resourceGraph) {
        return [{
            miniapp: '*',
            instances: descriptionMatchInstances(resourceGraph) // inhibit the same instances as this application matches
        }];
    },

    displayPriority: 400,
    setupPriority: 100

};