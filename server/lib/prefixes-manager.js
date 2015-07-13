'use strict';

var http = require('http');
var url = require('url');
var Q = require('q');

var prefixes = require('../models/prefixes');
var prefixesParser = require('./prefixes-parser');
var PrefixesReplacer = require('./prefixes-replacer');


function PrefixesManager () {

    var replacers = {};

    function retrievePrefixes(endpointUrl) {

        var deferred = Q.defer();

        var requestParams = url.parse(endpointUrl);
        requestParams.path = requestParams.path + '?nsdecl';

        http.get(requestParams, function(res) {
            var responseString = '';
            res.on('data', function(chunk) {
                responseString += chunk;
            });
            res.on('end', function() {
                var prefixes = prefixesParser.parse(responseString);
                deferred.resolve(prefixes);
            });
        }).on('error', function(error) {
            console.log(error);
            deferred.reject("Cannot retrieve endpoint namespace prefixes");
        });

        return deferred.promise;
    }

    this.getPrefixes = function(endpoint) {
        var deferred = Q.defer();

        if (!endpoint.alias) {
            deferred.reject("Endpoint alias not provided");
        }

        var stored = prefixes.findByAlias(endpoint.alias);

        if (stored) {
            deferred.resolve(stored.prefixes);
        }
        else {
            // We need to contact the
            if (!endpoint.url) {
                deferred.reject("Endpoint URL not provided")
            }
            else {

                retrievePrefixes(endpoint.url)
                    .then(function(prefixes) {
                        deferred.resolve(prefixes);
                    })
                    .catch(function(error) {
                        deferred.reject(error);
                    })
                    .done();

            }
        }

        return deferred.promise;
    };

    this.getReplacer = function(endpoint) {
        var deferred = Q.defer();

        if (!endpoint.alias) {
            deferred.reject("Endpoint alias not provided");
        }

        if (replacers[endpoint.alias]) {
            deferred.resolve(replacers[endpoint.alias]);
        }
        else {
            this.getPrefixes(endpoint)
                .then(function(prefixes) {
                    replacers[endpoint.alias] = new PrefixesReplacer(prefixes);
                    deferred.resolve(replacers[endpoint.alias])
                })
                .catch(function(error) {
                    deferred.reject(error);
                })
                .done();
        }

        return deferred.promise;
    }

}

var prefixesManager = new PrefixesManager();
module.exports = prefixesManager;