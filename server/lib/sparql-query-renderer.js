/**
 * SPARQL QUERY RENDERER
 */

var fs = require('fs');
var _ = require('lodash');
var http = require('http');
var url = require('url');

/**
 * SparqlQueryRenderer
 * Tool for generating SPARQL queries
 * @param {string} sparqlQueryText SPARQL query file
 * @constructor
 */
function SparqlQueryRenderer(sparqlQueryText)
{

    var filters = {
        "escape-uri": filterEscapeUri,
        "escape-uri-list": filterEscapeUriList,
        "escape-single-quotes": filterEscapeSingleQuotes,
        "escape-double-quotes": filterEscapeDoubleQuotes,
        "no-escape": filterNoEscape
    };

    var defaultFilter = 'escape-uri';

    // Regex for string between "{{" and "}}"
    var paramRegex = /{{((?!}).)+}}/g;
    var paramContentRegex = /^[ ]*([a-zA-Z0-9-_]+)[ ]*(\|[ ]*([a-zA-Z0-9-_]+)[ ]*)?(\|[ ]*default:("(.*)"|([0-9]+))[ ]*)?$/;
    // load SPARQL query file
    var definitions = [];
    var preparedQueryText = sparqlQueryText.replace(paramRegex, function(paramMatch) {
        paramMatch = paramMatch.substring(2, paramMatch.length - 2);
        var defMatch = paramMatch.match(paramContentRegex);
        if (!defMatch) {
            throw new Error("Invalid param definition in SPARQL query: " + paramMatch);
        }

        var filterName = defMatch[3] ? defMatch[3] : defaultFilter;
        if (!filters[filterName]) {
            throw new Error("Invalid filter name in SPARQL query: " + paramMatch);
        }

        var definition = {
            param: defMatch[1],
            filter: filterName,
            default: defMatch[6] ? defMatch[6] : (defMatch[7] ? defMatch[7] : null)
        };
        definitions.push(definition);
        return "{{" + (definitions.length - 1) + "}}";
    });

    /**
     * Replace "'" with "\'" in input string
     * @param string
     * @returns {string}
     */
    function filterEscapeSingleQuotes(string) {
        return string.replace(/'/g, "\\'");
    }

    /**
     * Replace '"' with '\"' in input string
     * @param string
     * @returns {string}
     */
    function filterEscapeDoubleQuotes(string) {
        return string.replace(/"/g, '\\"');
    }

    /**
     * Escapes URI if it is not prefixed
     * @param string
     * @returns {string}
     */
    function filterEscapeUri (string) {
        if (_.startsWith(string, 'http://')) {
            return '<' + string + '>';
        }
        return string;
    }

    /**
     * Escapes each URI in a list of resources if it is not prefixed
     * @param stringOrArray
     * @returns {string}
     */
    function filterEscapeUriList (stringOrArray) {
        if (!_.isArray(stringOrArray)) {
            stringOrArray = stringOrArray.split(' ');
        }
        var result = _.map(stringOrArray, function(item) {
            return filterEscapeUri(item);
        });
        return result.join(' ');
    }

    /**
     * Does nothing
     * @param string
     * @returns {*}
     */
    function filterNoEscape (string) {
        return string;
    }

    /**
     * Generates complete SPARQL text using input parameters
     * @param {object} params
     * @returns {string}
     */
    this.renderQuery = function(params) {
        params = params || {};

        var thisInstance = this;

        // match all possible parameter definitions in prepared SPARQL query
        // for example {{1}} is the definition of the first parameter in query
        return preparedQueryText.replace(paramRegex, function(match) {
            // convert match to JSON object
            var number = match.substring(2, match.length - 2);
            if (!definitions[number]) {
                throw new Error("Invalid format of sparql query, definition number expected: " + number );
            }
            var definition = definitions[number];

            var output = null;

            if (_.has(params, definition.param)) {
                output = params[definition.param];
                if (definition.filter && filters[definition.filter]) {
                    output = filters[definition.filter](output);
                }
            } else if (definition.default !== null) {
                output = definition.default;
            }

            if (output === null)
                throw Error("SparqlQueryRenderer: parameter missing - " + definition.param);

            return output;
        });
    };

}

module.exports = SparqlQueryRenderer;
