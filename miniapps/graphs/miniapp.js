var _ = require('lodash');

var Broker = require('../../server/lib/sparql-query-broker');

module.exports = {

    description: 'Empty resource information',

    matchInstances: function(resourceGraph) {
        return resourceGraph['@id'] == "http://graphs";
    },

    inhibitInstances: function(resourceGraph) {
        return [{
            miniapp: '*',
            instances: true
        }];
    },

    setupApplication: function(app, auth) {

        var query = require('./queries/list-graphs.sparql');
        var adapter = require('./queries/list-graphs-adapter');
        var brokerInstance = new Broker(query, adapter);

        //app.use('/api/graphs', auth.requiresAdmin);

        app.get('/api/graphs', brokerInstance.serve);

    },

    displayPriority: 100,
    setupPriority: 100

};