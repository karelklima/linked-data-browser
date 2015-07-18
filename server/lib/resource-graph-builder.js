'use strict';

var Q = require('q');
var _ = require('lodash');

var ToasterError = require('../lib/toaster-error');
var Broker = require('../lib/sparql-query-broker');

var describePropertiesQuery = require('../queries/describe-properties.sparql');
var describePropertiesAdapter = require('../queries/describe-properties-adapter');
var describePropertiesBroker = new Broker(describePropertiesQuery, describePropertiesAdapter);

var describePropertyOutgoingQuery = require('../queries/describe-property-subject.sparql');
var describePropertyIncomingQuery = require('../queries/describe-property-object.sparql');
var describePropertyAdapter = require('../queries/describe-property-adapter');
var describePropertyOutgoingBroker = new Broker(describePropertyOutgoingQuery, describePropertyAdapter);
var describePropertyIncomingBroker = new Broker(describePropertyIncomingQuery, describePropertyAdapter);

var describeLabelsQuery = require('../queries/describe-labels.sparql');
var describeLabelsBroker = new Broker(describeLabelsQuery);

function ResourceGraphBuilder() {

    function fetchData(propertiesData, requestQuery) {
        var deferred = Q.defer();

        if (propertiesData['@graph'].length < 1) {
            deferred.resolve([propertiesData]);
            return deferred.promise; // empty result
        }

        var promises = [];

        var labels = [];

        var data = propertiesData['@graph'][0];

        _.forEach(data['subject'], function(outProperty) {
            var query = _.clone(requestQuery);
            query.property = outProperty['@id'];
            labels.push(outProperty['@id']);
            promises.push(describePropertyOutgoingBroker.broke(query));
        });
        _.forEach(data['object'], function(inProperty) {
            var query = _.clone(requestQuery);
            query.property = inProperty['@id'];
            labels.push(inProperty['@id']);
            promises.push(describePropertyIncomingBroker.broke(query));
        });
        _.forEach(data['@type'], function(type) {
            labels.push(type);
        });

        delete data['subject'];
        delete data['object'];
        promises.push(propertiesData); // types information

        Q.all(promises)
            .spread(function() {
                deferred.resolve(arguments);
            })
            .catch(function(error) {
                deferred.reject(error);
            })
            .done();

        return deferred.promise;
    }

    function consolidateData(fetchedData) {

        if (fetchedData.length == 1 && fetchedData[0]['@graph'].length < 1) {
            throw new Error("Invalid data for resource graph build");
        }

        var output = _.last(fetchedData)['@graph'][0];
        output.property = [];

        fetchedData = _.dropRight(fetchedData);

        _.forEach(fetchedData, function(data) {
            if (!_.isArray(data['@graph']) || data['@graph'].length != 1) {
                throw new Error("Invalid data recieved for consolidation");
            }
            output.property.push(data['@graph'][0]);
        });

        return output;
    }

    this.build = function(requestQuery) {

        return describePropertiesBroker.broke(requestQuery)
            .then(function(data) {
                if (data['@graph'].length < 1) {
                    throw new ToasterError("Requested resource not found");
                }
                return fetchData(data, requestQuery);
            })
            .then(consolidateData);

    }

}

var resourceGraphBuilder = new ResourceGraphBuilder();
module.exports = resourceGraphBuilder;