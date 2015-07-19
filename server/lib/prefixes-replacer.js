/*
 * PrefixReplacer
 */

var _ = require('lodash');

/**
 * PrefixReplacer
 * Provides methods to contract or expand URIs with prefixes
 * @constructor
 */
function PrefixReplacer(prefixes)
{
    this.expand = function(value)
    {
        _.forEach(prefixes, function(url, prefix) {
            prefix = prefix + ':';
            if (_.startsWith(value, prefix)) {
                value = url + value.substr(prefix.length);
                return false; // exit loop
            }
        });
        return value;
    };

    this.contract = function(value)
    {
        _.forEach(prefixes, function(url, prefix) {
            if (_.startsWith(value, url)) {
                var candidate = prefix + ':' + value.substr(url.length);
                if (!_.contains(candidate, '/')) { // ensure the prefixed string does not contain slashes
                    value = candidate;
                    return false; // exit loop
                }
            }
        });
        return value;
    };

}

/**
 * PrefixReplacer class / constructor
 * @type {PrefixReplacer}
 */
module.exports = PrefixReplacer;



