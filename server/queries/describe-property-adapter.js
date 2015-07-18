var _ = require('lodash');
var config = require('../../config');

module.exports = function(query) {

    query.prepareParams = function(params) {
        params['requested-properties'] = config.describeQuery.properties;
        params['limit'] = params['limit'] || config.describeQuery.sampleCount;
        return params;
    };

    query.getContext = function() {
        return {
            "label" : "http://my/label",
            "relation" : "http://my/relation",
            "count" : "http://my/count",
            "graph" : "http://my/graph",
            "data" : "http://my/data"
        }
    };

    query.prepareResponse = function(response) {

        if (!_.isArray(response['@graph']) || response['@graph'].length != 1) {
            throw new Error("Invalid SPARQL response, one object expected");
        }

        var mainObject = response['@graph'][0];
        if (mainObject['relation'][0]['@id'] == "http://my/subject") {
            mainObject['relation'] = "subject";
        } else {
            mainObject['relation'] = "object";
        }
        mainObject['graph'] = _.map(mainObject['graph'], function(graph) {
            return graph['@id'];
        });

        return response
    };

    query.getModel = function() {
        return {
            "@id" : ["string", "undefined"],
            "label" : ["array", []],
            "relation" : ["string", "undefined"],
            "count": ["number", 0],
            "graph": ["array", []],
            "data": ["array", []]
        }
    };

};