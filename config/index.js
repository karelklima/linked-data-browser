'use strict';

var path = require('path');

var rootPath = path.normalize(__dirname + '/..');

module.exports = {
    root: rootPath,

    datastore: rootPath + '/datastore',

    httpPort:  process.env.PORT || 3000,

    hostname: process.env.HOST || process.env.HOSTNAME,

    title: 'LinkedData Explorer',

    // token secret salt
    secret: '2cd324f30dc548396570da4e637c53ee',

    // Project-wide template engine
    templateEngine: 'swig',

    // Morgan logging options
    logging: {
        format: 'tiny'
    },

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
        timeout: "60000"
    },

    endpointCustomParamPrefix: 'endpoint-param-',

    endpointRequestTimeout: 60000,

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