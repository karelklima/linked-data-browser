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
            "id": "http://my/id",
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
        mainObject['@id'] = mainObject['id'][0]['@id']; // object reconstruction fix
        if (mainObject['relation'][0]['@id'] == "http://my/subject") {
            mainObject['relation'] = "subject";
        } else {
            mainObject['relation'] = "object";
        }

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