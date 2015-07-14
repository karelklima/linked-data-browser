'use strict';

var Broker = require('../lib/sparql-query-broker');

var searchQuery = require('../queries/search.sparql');
var searchAdapter = require('../queries/search-adapter');

var searchBroker = new Broker(searchQuery, searchAdapter);

exports.search = searchBroker.serve;