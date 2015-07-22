'use strict';

var Q = require('q');
var _ = require('lodash');

var ToasterError = require('../lib/toaster-error');
var Broker = require('../lib/sparql-query-broker');

var describeTypeQuery = require('../queries/describe-type.sparql');
var describeTypeBroker = new Broker(describeTypeQuery);

var describePropertiesAdapter = require('../queries/describe-properties-adapter');
var describePropertiesSubjectQuery = require('../queries/describe-properties-subject.sparql');
var describePropertiesSubjectBroker = new Broker(describePropertiesSubjectQuery, describePropertiesAdapter);
var describePropertiesObjectQuery = require('../queries/describe-properties-object.sparql');
var describePropertiesObjectBroker = new Broker(describePropertiesObjectQuery, describePropertiesAdapter);

var describePropertySubjectQuery = require('../queries/describe-property-subject.sparql');
var describePropertyObjectQuery = require('../queries/describe-property-object.sparql');
var describePropertyAdapter = require('../queries/describe-property-adapter');
var describePropertySubjectBroker = new Broker(describePropertySubjectQuery, describePropertyAdapter);
var describePropertyObjectBroker = new Broker(describePropertyObjectQuery, describePropertyAdapter);

function ResourceGraphBuilder() {

    function fetchDefinition(requestQuery) {

        console.log(requestQuery);

        return Q.all([
            requestQuery,
            describeTypeBroker.broke(requestQuery),
            describePropertiesSubjectBroker.broke(requestQuery),
            describePropertiesObjectBroker.broke(requestQuery)
        ]);

    }

    function consolidateDefinition(requestQuery, typesResponse, subjectPropertiesResponse, objectPropertiesResponse) {

        var definitionData = {};

        if (typesResponse['@graph'] && typesResponse['@graph'].length > 0) {
            definitionData = _.merge(definitionData, typesResponse);
        }
        if (subjectPropertiesResponse['@graph'] && subjectPropertiesResponse['@graph'].length > 0) {
            definitionData = _.merge(definitionData, subjectPropertiesResponse);
        }
        if (objectPropertiesResponse['@graph'] && objectPropertiesResponse['@graph'].length > 0) {
            definitionData = _.merge(definitionData, objectPropertiesResponse);
        }

        if (!_.has(definitionData, "@graph")) {
            throw new ToasterError("The requested resource not found");
        }

        return [requestQuery, definitionData];

    }

    function fetchProperties(requestQuery, definitionData) {

        var propertyPromises = [];

        var data = definitionData['@graph'][0];

        _.forEach(data['subject'], function(outProperty) {
            var query = _.clone(requestQuery);
            query.property = outProperty['@id'];
            propertyPromises.push(describePropertySubjectBroker.broke(query));
        });
        _.forEach(data['object'], function(inProperty) {
            var query = _.clone(requestQuery);
            query.property = inProperty['@id'];
            propertyPromises.push(describePropertyObjectBroker.broke(query));
        });

        delete data['subject'];
        delete data['object'];

        return [
            requestQuery,
            definitionData,
            Q.all(propertyPromises)
        ];

    }

    function consolidateProperties(requestQuery, definitionData, propertyData) {

        var target = definitionData['@graph'][0];
        target.property = [];

        _.forEach(propertyData, function(data) {
            if (!_.isArray(data['@graph']) || data['@graph'].length != 1) {
                throw new Error("Invalid data recieved for consolidation");
            }
            target.property.push(data['@graph'][0]);
        });

        return definitionData;
    }

    this.build = function(requestQuery) {

        return Q([requestQuery])
            .spread(fetchDefinition)
            .spread(consolidateDefinition)
            .spread(fetchProperties)
            .spread(consolidateProperties);

    }

}

var resourceGraphBuilder = new ResourceGraphBuilder();
module.exports = resourceGraphBuilder;