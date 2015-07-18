'use strict';

var domain = require('domain');
var http = require('http');
var querystring = require('querystring');
var url = require('url');

var Q = require('q');
var _ = require('lodash');

var ToasterError = require('./toaster-error');
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
            deferred.reject(new ToasterError("Error occurred while contacting SPARQL endpoint", 500, error.message));
        });
        request.setTimeout(config.endpointRequestTimeout, function() {
            deferred.reject(new ToasterError("SPARQL endpoint connection timed out"));
        });

        return deferred.promise;
    }

    this.broke = function(requestQuery) {

        var sparqlEndpoint = null;

        return Q.fcall(function() {

            sparqlEndpoint = endpointResolver.resolve(requestQuery.endpoint);
            requestQuery = adapter.prepareParams(requestQuery);

            var queryText = renderer.renderQuery(requestQuery);

            if (config.logQueries) {
                console.log(queryText);
            }

            return sendRequest(queryText, sparqlEndpoint.url)
        })
            .then(function (data) {
                return adapter.handleResponse(data, requestQuery, sparqlEndpoint);
            });

    };

    this.serve = function(req, res, next) {

        Q()
            .then(function() {
                return self.broke(_.clone(req.query));
            })
            .then(function(data) {
                return res.status(200).json(data);
            })
            .catch(next)
            .done();

    }

}

module.exports = SparqlQueryBroker;