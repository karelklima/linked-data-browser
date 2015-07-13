var _ = require('lodash');
var config = require('../../config');

module.exports = function(query) {

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