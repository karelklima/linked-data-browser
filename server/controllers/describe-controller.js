'use strict';

var Q = require('q');
var _ = require('lodash');

var Toaster = require('../lib/toaster');
var Broker = require('../lib/sparql-query-broker');

var describeQuery = require('../queries/describe.sparql');
var describeAdapter = require('../queries/describe-adapter');
var describeBroker = new Broker(describeQuery, describeAdapter);

var describePartialQuery = require('../queries/describe-partial.sparql');
var describePartialAdapter = require('../queries/describe-partial-adapter');
var describePartialBroker = new Broker(describePartialQuery, describePartialAdapter);

var describePropertiesQuery = require('../queries/describe-properties.sparql');
var describePropertiesAdapter = require('../queries/describe-properties-adapter');
var describePropertiesBroker = new Broker(describePropertiesQuery, describePropertiesAdapter);

var describePropertyOutgoingQuery = require('../queries/describe-property-outgoing.sparql');
var describePropertyIncomingQuery = require('../queries/describe-property-incoming.sparql');
var describePropertyAdapter = require('../queries/describe-property-adapter');
var describePropertyOutgoingBroker = new Broker(describePropertyOutgoingQuery, describePropertyAdapter);
var describePropertyIncomingBroker = new Broker(describePropertyIncomingQuery, describePropertyAdapter);

var describeLabelsQuery = require('../queries/describe-labels.sparql');
var describeLabelsBroker = new Broker(describeLabelsQuery);

var describeNativeQuery = require('../queries/describe-native.sparql');
var describeNativeAdapter = require('../queries/describe-native');
var describeNativeBroker = new Broker(describeNativeQuery, describeNativeAdapter);

exports.describe = describeBroker.serve;

exports.describeProperties = describePropertiesBroker.serve;

exports.describeOutgoingProperty = describePropertyOutgoingBroker.serve;

exports.describePartial = function(req, res) {
    describePropertiesBroker.broke(req.query)
        .then(function(data) {
            req.query.properties = data;
            describePartialBroker.serve(req, res);
        });
};

exports.describeNative = describeNativeBroker.serve;

exports.describeBig = function(req, res) {

    function fetchData(propertiesData) {
        var deferred = Q.defer();

        if (propertiesData['@graph'].length < 1) {
            deferred.resolve([propertiesData]);
            return deferred.promise; // empty result
        }

        var promises = [];

        var labels = [];

        var data = propertiesData['@graph'][0];

        _.forEach(data['http://my/out'], function(outProperty) {
            var query = _.clone(req.query);
            query.property = outProperty['@id'];
            labels.push(outProperty['@id']);
            promises.push(describePropertyOutgoingBroker.broke(query));
        });
        _.forEach(data['http://my/in'], function(inProperty) {
            var query = _.clone(req.query);
            query.property = inProperty['@id'];
            labels.push(inProperty['@id']);
            promises.push(describePropertyIncomingBroker.broke(query));
        });
        _.forEach(data['@type'], function(type) {
            labels.push(type);
        });

        if (labels.length > 0) {
            var query = _.clone(req.query);
            query['requested-labels'] = labels;
            promises.push(describeLabelsBroker.broke(query)); // labels promise
        }

        delete data['http://my/out'];
        delete data['http://my/in'];
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
            return fetchedData[0]; // empty result
        }

        var resourceId = req.query.resource;
        var output = {
            "@graph": [{
                "@id": resourceId,
                "@type": [],
                "@label": {},
                "@out": {},
                "@in": {}
            }]
        };
        var target = output["@graph"][0];

        _.forEach(fetchedData, function(data) {
            if (!_.isArray(data['@graph'])) {
                throw new Error("Invalid data recieved for consolidation");
            }
            _.forEach(data['@graph'], function(object) {
                if (object['@id'] == 'http://my/out') {
                    delete object['@id'];
                    _.assign(target["@out"], object);
                }
                else if (object['@id'] == 'http://my/in') {
                    delete object['@id'];
                    _.assign(target["@in"], object);
                }
                else if (object['@id'] == resourceId && object['@type']) {
                    target['@type'] = object['@type'];
                }
                else { // labels
                    target['@label'][object['@id']] = object["rdfs:label"];
                }
            });

        });

        return output;
    }

    describePropertiesBroker.broke(req.query)
        .then(fetchData)
        .then(consolidateData)
        .then(function(consolidatedData) {
            return res.status(200).json(consolidatedData)
        })
        .catch(function(error) {
            if (error.message) {
                console.error(error.message);
                console.error(error.stack);
            } else {
                console.error(error);
            }
            var toaster = new Toaster();
            toaster.error("There has been a problem with SPARQL endpoint query, aborting operation.");
            return res.status(400).json(toaster.toJSON());
        });


};