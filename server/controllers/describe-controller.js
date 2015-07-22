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

exports.describe = describeBroker.serve;

var describeTypeQuery = require('../queries/describe-type.sparql');
var describeTypeBroker = new Broker(describeTypeQuery);

exports.describeType = describeTypeBroker.serve;

var describePropertiesAdapter = require('../queries/describe-properties-adapter');
var describePropertiesSubjectQuery = require('../queries/describe-properties-subject.sparql');
var describePropertiesSubjectBroker = new Broker(describePropertiesSubjectQuery, describePropertiesAdapter);
var describePropertiesObjectQuery = require('../queries/describe-properties-object.sparql');
var describePropertiesObjectBroker = new Broker(describePropertiesObjectQuery, describePropertiesAdapter);

exports.describePropertiesSubject = describePropertiesSubjectBroker.serve;
exports.describePropertiesObject = describePropertiesObjectBroker.serve;


var describePropertySubjectQuery = require('../queries/describe-property-subject.sparql');
var describePropertyObjectQuery = require('../queries/describe-property-object.sparql');
var describePropertyAdapter = require('../queries/describe-property-adapter');
var describePropertySubjectBroker = new Broker(describePropertySubjectQuery, describePropertyAdapter);
var describePropertyObjectBroker = new Broker(describePropertyObjectQuery, describePropertyAdapter);

exports.describePropertySubject = describePropertySubjectBroker.serve;
exports.describePropertyObject = describePropertyObjectBroker.serve;


var describeGraphsQuery = require('../queries/describe-graphs.sparql');
var describeGraphsAdapter = require('../queries/describe-graphs-adapter');
var describeGraphsBroker = new Broker(describeGraphsQuery, describeGraphsAdapter);

exports.describeGraphs = describeGraphsBroker.serve;

exports.describeGraph = function(req, res) {

    Q()
        .then(function() {
            return resourceGraphBuilder.build(req.query);
        })
        .then(function(resourceGraphWithView) {
            return res.status(200).json(resourceGraphWithView);
        })
        .catch(next)
        .done();

};

exports.describeFormatted = function(req, res, next) {

    Q()
        .then(function() {
            return resourceGraphBuilder.build(req.query);
        }).then(function(resourceGraph) {
            return viewBuilder.buildFormatted(resourceGraph);
        })
        .then(function(resourceGraphWithView) {
            return res.status(200).json(resourceGraphWithView);
        })
        .catch(next)
        .done();

};

exports.describeRaw = function(req, res, next) {

    Q()
        .then(function() {
            return resourceGraphBuilder.build(req.query);
        }).then(function(resourceGraph) {
            return viewBuilder.buildRaw(resourceGraph);
        })
        .then(function(resourceGraphWithView) {
            return res.status(200).json(resourceGraphWithView);
        })
        .catch(next)
        .done();

};

exports.describeEdit = function(req, res, next) {

    Q()
        .then(function() {
            return resourceGraphBuilder.build(req.query);
        }).then(function(resourceGraph) {
            return viewBuilder.buildEdit(resourceGraph);
        })
        .then(function(resourceGraphWithView) {
            return res.status(200).json(resourceGraphWithView);
        })
        .catch(next)
        .done();

};