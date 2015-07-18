'use strict';

module.exports = function(query) {

    query.getContext = function() {
        return {
            "subject" : "http://my/subject",
            "object" : "http://my/object"
        }
    };

};