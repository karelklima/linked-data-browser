'use strict';

var _ = require('lodash');
var htmlparser = require('htmlparser2');

/**
 * Converts Virtuoso predefined namespace prefixes list from HTML to JSON
 * @constructor
 */
function PrefixesParser() {

    this.parse = function(htmlCode) {

        var prefixes = {};

        var rowCount = 0;
        var cellCount = 0;
        var prefixHolder = null;
        var insideCell = false;

        var parser = new htmlparser.Parser({
            onopentag: function(tag, attributes) {

                if (tag == 'tr') {
                    rowCount++;
                } else if (tag == 'td') {
                    cellCount++;
                    insideCell = true;
                }

            },
            ontext: function(text) {
                if (!insideCell) {
                    return; // content has not started
                }
                text = _.trim(text);
                if (cellCount % 2 != 0) {
                    prefixHolder = text;
                } else {
                    prefixes[prefixHolder] = text;
                    prefixHolder = null;
                }
            },
            onclosetag: function(tag) {
                if (tag == 'td') {
                    insideCell = false;
                }
            }
        }, {decodeEntities: true});

        parser.write(htmlCode);
        parser.end();

        return prefixes;

    }

}

var prefixesParser = new PrefixesParser();
module.exports = prefixesParser;