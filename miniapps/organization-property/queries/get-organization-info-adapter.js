var _ = require('lodash');

module.exports = function(query) {

    query.getContext = function() {
        return {
            "title" : "http://my/title",
            "identifier" : "http://my/identifier"
        }
    };

};