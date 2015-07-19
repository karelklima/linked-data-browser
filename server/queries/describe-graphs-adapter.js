var _ = require('lodash');
var config = require('../../config');

module.exports = function(query) {

    query.getContext = function() {
        return {
            "subjectRelationsCount" : "http://my/subjectRelationsCount",
            "objectRelationsCount" : "http://my/objectRelationsCount"
        }
    };

    query.getModel = function() {
        return {
            "@id" : ["string", ""],
            "subjectRelationsCount" : ["number", 0],
            "objectRelationsCount" : ["number", 0]
        }
    };

};