var _ = require('lodash');

module.exports = function(query) {

    query.getContext = function() {
        return {
            "graph": "http://my/graph"
        }
    };

};