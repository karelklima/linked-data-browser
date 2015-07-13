var _ = require('lodash');
var config = require('../../config');

module.exports = function(query) {

    query.prepareParams = function(params) {

        params.limit = params.limit || 10;
        params.secondaryproperties = config.describeQuery.properties;

        var selectPattern = '{ SELECT ?_Predicate ?_Object '
            + 'WHERE { BIND (__PREDICATE__ as ?_Predicate) resource: ?_Predicate ?_Object } '
            + 'LIMIT __LIMIT__ }';

        var outSelects = [];
        _.forEach(params.properties["@out"], function(outProp) {
            if (_.startsWith(outProp, 'http://')) {
                outProp = '<' + outProp + '>';
            }
            var outSelect = selectPattern
                .replace(/__PREDICATE__/gi, outProp)
                .replace(/__LIMIT__/gi, params.limit)
                .replace(/_/gi, 'out');
            outSelects.push(outSelect);
        });
        params.outselects = outSelects.join(' UNION ');

        var inSelects = [];
        _.forEach(params.properties["@in"], function(outProp) {
            if (_.startsWith(outProp, 'http://')) {
                outProp = '<' + outProp + '>';
            }
            var inSelect = selectPattern
                .replace(/__PREDICATE__/gi, outProp)
                .replace(/__LIMIT__/gi, params.limit)
                .replace(/_/gi, 'in');
            inSelects.push(inSelect);
        });
        params.inselects = inSelects.join(' UNION ');

        return params;

    };

    query.prepareResponse = function(response, requestParams) {

        var output = {
            "@graph": {
                "@id": requestParams.resource,
                "@labels": {},
                "@out": {},
                "@in": {}
            }
        };

        if (_.has(response, "@graph")) {
            if (response["@graph"].length > 1) {
                throw new Error("Invalid result of describe query");
            }
            var master = response["@graph"][0];
            var target = output["@graph"];
            if (master) { // just in case or empty results
                if (_.has(master, "http://my/labels")) {
                    _.forEach(master["http://my/labels"], function(label) {
                        var list = [];
                        if (_.has(label, "http://my/label")) {
                            list = label["http://my/label"];
                        }
                        target["@labels"][label["@id"]] = list;
                    });
                }
                if (_.has(master, "http://my/out")) {
                    target["@out"] = master["http://my/out"][0];
                    delete target["@out"]["@id"];
                }
                if (_.has(master, "http://my/in")) {
                    target["@in"] = master["http://my/in"][0];
                    delete target["@in"]["@id"];
                }
            }
        }
        return output;
    }

};