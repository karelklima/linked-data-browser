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
        timeout: "10000"
    },

    endpointRequestTimeout: 10000,

    logQueries: true,

    describeQuery: {
        properties: [
            "rdf:type",
            "foaf:name",
            "dcterms:title",
            "skos:prefLabel",
            "http://schema.org/name"
        ],
        sampleCount: 5
    },

    searchQuery: {
        labels: [
            "rdfs:label",
            "foaf:name",
            "dcterms:title",
            "skos:prefLabel",
            "http://schema.org/name"
        ]
    },

    queryAdapter: {
        defaultContext: false,
        compactOptions: {"graph" : true, "compactArrays" : false},
        defaultModel: false,
        replacePrefixes: false,
        reconstructComplexObjects: true,
        dates : {
            convert : true,
            suffix : "Iso",
            inputTypes : [
                "http://www.w3.org/2001/XMLSchema#date"
            ],
            inputFormats : [
                "YYYY-MM-DDZ",
                "YYYY-MM-DDTHH:mm:ssZ"
            ],
            outputFormat : "YYYY-MM-DD"
        }
    }
};