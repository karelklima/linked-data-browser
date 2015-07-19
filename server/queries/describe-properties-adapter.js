'use strict';

module.exports = function(query) {

    query.getContext = function() {
        return {
            "subject" : "http://my/subject",
            "object" : "http://my/object"
        }
    };

    query.prepareResponse = function(response) {
        return response;
    };

    query.getModel = function() {
        return {
            "@id" : ["string", "undefined"],
            "@type" : ["array", []],
            "object" : ["array", []],
            "subject" : ["array", []]
        }
    };

};