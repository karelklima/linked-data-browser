var _ = require('lodash');

var Broker = require('../../server/lib/sparql-query-broker');

function partnerMatchInstances(resourceGraph) {
    var instances = [];
    _.forEach(resourceGraph.property, function (property) {
        if (property.relation != 'subject' || property.data.length != 1) {
            return; // continue
        }
        if (_.includes(property.sampleTypes, 'http://purl.org/goodrelations/v1#BusinessEntity')
            || _.includes(property.sampleTypes, 'http://schema.org/Organization')) {
            instances.push({
                property: property['@id'],
                relation: property['relation']
            });
            return false; // exit loop
        }
    });
    return instances;
}

module.exports = {

    description: 'Organization or BusinessEntity display',

    matchInstances: partnerMatchInstances,

    inhibitInstances: function(resourceGraph) {
        return [{
            miniapp: '*',
            instances: partnerMatchInstances(resourceGraph) // inhibit the same instances as this application matches
        }];
    },

    setupApplication: function(app, auth) {

        var query = require('./queries/get-organization-info.sparql');
        var adapter = require('./queries/get-organization-info-adapter');
        var brokerInstance = new Broker(query, adapter);

        app.route('/api/organization-property')
            .get(brokerInstance.serve);

    },

    displayPriority: 100,
    setupPriority: 0

};