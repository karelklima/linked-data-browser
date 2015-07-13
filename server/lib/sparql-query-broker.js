'use strict';

var domain = require('domain');
var http = require('http');
var querystring = require('querystring');
var url = require('url');

var Q = require('q');
var _ = require('lodash');

var Toaster = require('./toaster');
var SparqlQueryRenderer = require('./sparql-query-renderer');
var SparqlQueryAdapter = require('./sparql-query-adapter');
var endpointResolver = require('./endpoint-resolver');

var config = require('../../config');

function SparqlQueryBroker(sparqlQuery, queryAdapter) {

    var self = this;

    if (_.isEmpty(sparqlQuery)) {
        throw new Error("Sparql query cannot be empty");
    }

    if (queryAdapter != null && !_.isFunction(queryAdapter)) {
        throw new Error("Query adapter must be a function or null");
    }

    var renderer = new SparqlQueryRenderer(sparqlQuery);
    var adapter = new SparqlQueryAdapter();

    if (queryAdapter) {
        queryAdapter(adapter);
    }

    function sendRequest(sparqlQuery, sparqlEndpointUrl) {

        var deferred = Q.defer();

        var params = _.clone(config.endpointParams);
        params["query"] = sparqlQuery; // sends query as query string parameter

        var requestParams = url.parse(sparqlEndpointUrl);
        requestParams.path = requestParams.path + '?' + querystring.stringify(params);

        var request = http.get(requestParams, function(res) {
            var responseString = '';
            res.on('data', function(chunk) {
                responseString += chunk;
            });
            res.on('end', function() {
                deferred.resolve(responseString);
            });
        }).on('error', function(error) {
            console.log(error);
            deferred.reject("Datastore error");
        });
        request.setTimeout(config.endpointRequestTimeout, function() {
            deferred.reject("Connection timeout");
        });

        return deferred.promise;
    }

    this.broke = function(requestQuery) {

        var deferred = Q.defer();

        var d = domain.create();

        d.on('error', function(error) {
            deferred.reject(error);
        });

        d.run(function() {
            process.nextTick(function() { // make it async
                var sparqlEndpoint = endpointResolver.resolve(requestQuery.endpoint);

                requestQuery = adapter.prepareParams(requestQuery);

                var queryText = renderer.renderQuery(requestQuery);
                console.log(queryText);

                sendRequest(queryText, sparqlEndpoint.url)
                    .then(function (data) {
                        return adapter.handleResponse(data, requestQuery, sparqlEndpoint);
                    })
                    .then(function (data) {
                        deferred.resolve(data);
                    })
                    .done();
            });
        });

        return deferred.promise;

    };

    this.serve = function(req, res) {

        self.broke(_.clone(req.query))
            .then(function(data) {
                return res.status(200).json(data);
            })
            .catch(function(error) {
                if (_.isString(error)) {
                    console.error(error);
                } else {
                    console.error(error.message);
                    console.error(error.stack);
                }
                var toaster = new Toaster();
                toaster.error("There has been a problem with SPARQL endpoint query, aborting operation.");
                return res.status(400).json(toaster.toJSON());
            })
            .done();

    }

}

module.exports = SparqlQueryBroker;