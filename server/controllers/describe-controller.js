'use strict';

var domain = require('domain');

var Q = require('q');
var _ = require('lodash');

var Toaster = require('../lib/toaster');
var Broker = require('../lib/sparql-query-broker');
var resourceGraphBuilder = require('../lib/resource-graph-builder');
var viewBuilder = require('../lib/view-builder');

var describeQuery = require('../queries/describe.sparql');
var describeAdapter = require('../queries/describe-adapter');
var describeBroker = new Broker(describeQuery, describeAdapter);

var describePropertiesQuery = require('../queries/describe-properties.sparql');
var describePropertiesAdapter = require('../queries/describe-properties-adapter');
var describePropertiesBroker = new Broker(describePropertiesQuery, describePropertiesAdapter);

var describePropertySubjectQuery = require('../queries/describe-property-subject.sparql');
var describePropertyObjectQuery = require('../queries/describe-property-object.sparql');
var describePropertyAdapter = require('../queries/describe-property-adapter');
var describePropertySubjectBroker = new Broker(describePropertySubjectQuery, describePropertyAdapter);
var describePropertyObjectBroker = new Broker(describePropertyObjectQuery, describePropertyAdapter);

var describeLabelsQuery = require('../queries/describe-labels.sparql');
var describeLabelsBroker = new Broker(describeLabelsQuery);

var describeGraphsQuery = require('../queries/describe-graphs.sparql');
var describeGraphsAdapter = require('../queries/describe-graphs-adapter');
var describeGraphsBroker = new Broker(describeGraphsQuery, describeGraphsAdapter);

exports.describe = describeBroker.serve;

exports.describeProperties = describePropertiesBroker.serve;

exports.describePropertySubject = describePropertySubjectBroker.serve;

exports.describePropertyObject = describePropertyObjectBroker.serve;

exports.describeGraphs = describeGraphsBroker.serve;

exports.describeGraph = function(req, res) {

    resourceGraphBuilder
        .build(req.query)
        .then(function(consolidatedData) {
            return res.status(200).json(consolidatedData)
        })
        .catch(function(error) {
            console.error(error.message);
            console.error(error.stack);
            var toaster = new Toaster();
            toaster.error("There has been a problem with SPARQL endpoint query, aborting operation.");
            return res.status(400).json(toaster.toJSON());
        });

};

exports.describeRaw = function(req, res, next) {

    Q()
        .then(function() {
            return resourceGraphBuilder.build(req.query);
        }).then(function(resourceGraph) {
            return viewBuilder.buildRaw(resourceGraph);
        })
        .then(function(resourceGraphWithView) {
            return res.status(200).json({
                '@graph': [resourceGraphWithView]
            });
        })
        .catch(next)
        .done();

};