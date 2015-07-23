'use strict';

var path = require('path');

var rootPath = path.normalize(__dirname + '/../..');

module.exports = {
    root: rootPath,

    datastore: rootPath + '/datastore',

    http: {
        port: process.env.PORT || 3000
    },
    hostname: process.env.HOST || process.env.HOSTNAME,

    // Project-wide template engine
    templateEngine: 'swig',

    defaultLayout: 'single-column',

    defaultAdminAccount: {
        email: 'admin@admin.com',
        password: 'admin'
    },

    defaultEndpoint: {
        name: 'Opendata.cz',
        alias: 'opendata',
        url: 'http://linked.opendata.cz/sparql'
    },

    defaultLanguage: {
        label: 'EN',
        alias: 'en'
    },

    endpointParams: {
        format: "application/ld+json",
        timeout: "20000"
    },

    endpointCustomParamPrefix: 'endpoint-param-',

    endpointRequestTimeout: 20000,

    logQueries: true,

    describeQuery: {
        properties: [
            "rdf:type",
            "foaf:name",
            "dcterms:title",
            "skos:prefLabel"
        ],
        sampleCount: 5
    },

    searchQuery: {
        labels: [
            "rdfs:label",
            "foaf:name",
            "dcterms:title",
            "skos:prefLabel"
        ]
    },

    queryAdapter: {
        defaultContext: false,
        defaultAdvancedContext: false,
        compactOptions: {"graph" : true, "compactArrays" : false},
        defaultModel: false,
        replacePrefixes: false,
        reconstructComplexObjects: true
    }
};