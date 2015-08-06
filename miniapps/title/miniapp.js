var _ = require('lodash');

function titleMatchInstances(resourceGraph) {
    var instances = [];
    if (_.find(resourceGraph.property, { '@id': 'http://purl.org/dc/terms/title', 'relation': 'subject' })) {
        return [{ property: 'http://purl.org/dc/terms/title', relation: 'subject'}];
    }
    return instances;
}

module.exports = {

    description: 'Title display - dcterms:title',

    matchInstances: titleMatchInstances,

    inhibitInstances: function(resourceGraph) {
        return [{
            miniapp: '*',
            instances: titleMatchInstances(resourceGraph) // inhibit the same instances as this application matches
        }];
    },

    displayPriority: 400,
    setupPriority: 100

};