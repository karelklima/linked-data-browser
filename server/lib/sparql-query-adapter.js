/**
 * SPARQL ROUTE JSONLD
 */

var jsonld = require('jsonld');
var _ = require('lodash');
var Q = require('q');
var moment = require('moment');

var config = require('../../config');
var prefixesManager = require('./prefixes-manager');

/**
 * SparqlQueryAdapter
 * SPARQL query support in JSON-LD format
 * @constructor
 */
function SparqlQueryAdapter() {

    var self = this;

    // Override of SparqlRoute.handleResponse
    this.handleResponse = function(responseString, requestParams, sparqlEndpoint) {
        var deferred = Q.defer();

        if (!_.startsWith(responseString, '{')) {
            deferred.reject(responseString);
        } else {

            // Initiate main workflow
            Q.fcall(function () {
                return responseString;
            })
                .then(function (r) {
                    return JSON.parse(responseString);
                })
                .then(function (r) {
                    return self.fixRDFType(r);
                })
                .then(function (r) {
                    return self.applyContext(r);
                })
                .then(function (r) {
                    return self.convertDates(r);
                })
                .then(function (r) {
                    return self.reconstructComplexObjects(r);
                })
                .then(function (r) {
                    return self.processPrefixedProperties(r, sparqlEndpoint);
                })
                .then(function (r) {
                    return self.prepareResponse(r, requestParams);
                })
                .then(function (r) {
                    return self.processModel(r);
                })
                .then(function (responseJSON) {
                    deferred.resolve(responseJSON);
                })
                .done(); // throw errors if any
        }

        return deferred.promise;

    };

    // Converts @type properties to string - Virtuoso bug fix
    this.fixRDFType = function(response) {
        if (!_.has(response, "@graph"))
            return response;

        var graph = response["@graph"];
        _.each(response["@graph"], function(item) {
            if (_.has(item, "@type")) {
                var type = item["@type"];
                if (_.isArray(type)) {
                    item["@type"] = _.map(type, function(t) {
                        if (_.isObject(t) && _.has(t, '@id')) {
                            return t['@id'];
                        } else {
                            return t;
                        }
                    })
                }
            }
        });

        return response;
    };

    // Applies context to JSON-LD Virtuoso response using JSONLD library
    this.applyContext = function(response) {
        var context = this.getContext();
        if (!context) {
            return response;
        }

        var p = jsonld.promises();
        return p.compact(response, this.getContext(), config.queryAdapter.compactOptions);
    };

    // Converts dates according to configuration
    this.convertDates = function(response) {
        if (self.getConvertDates()) {
            var context = response["@context"];
            _.each(_.keys(context), function(key) {
                if (_.isObject(context[key]) && _.has(context[key], "@type") && _.contains(self.getDateInputTypes(), context[key]["@type"])) {
                    _.each(response["@graph"], function(item) {
                        if (_.has(item, key)) {
                            try {
                                var convertedKey = key + self.getDateSuffix();
                                if (_.has(item, convertedKey) && key != convertedKey) {
                                    // do nothing
                                } else {
                                    var temp = item[key][0].substring(0, 10);
                                    temp = moment(temp);
                                    //temp.add('days', 1); // fix Virtuoso timezone bug
                                    item[convertedKey] = [temp.format(self.getDateOutputFormat())];
                                }
                            }
                            catch (e)
                            {
                                throw new Error("Unable to parse date: " + item[key]);
                            }
                        }
                    });
                }
            });
        }
        return response;
    };

    // Converts list of response graph objects into one complex object based on @id
    this.reconstructComplexObjects = function(response) {

        if (!this.getReconstructComplexObjects()) // do not reconstruct
            return response;

        var objects = {};

        _.each(response["@graph"], function(object) {
            objects[object["@id"]] = {
                data: object,
                isLinked: false
            };
        });

        // find links among graph objects
        _.each(response["@graph"], function(object) {
            _.each(object, function(values, key) {
                if (key.indexOf("@") == 0)
                    return; // RDF-specific property
                _.each(values, function(value, index) {
                    if (_.has(objects, value)) { // link to another object
                        values[index] = objects[value].data;
                        objects[value].isLinked = true;
                    }
                    else if (_.isObject(value) && value["@id"] && _.has(objects, value["@id"])) {
                        values[index] = objects[value["@id"]].data;
                        objects[value["@id"]].isLinked = true;
                    }
                });
            });
        });

        response["@graph"] = [];

        // only include non-linked nodes in final response
        _.each(objects, function(object) {
            if (!object.isLinked)
                response["@graph"].push(object.data);
        });

        return response;
    };

    // Applies data model to response
    this.processModel = function(response) {

        var model = this.getModel();

        if (!model) // do not apply model
            return response;

        try {

            var processModelPart = function(objects, model) {

                var keys = _.keys(model);
                var defaults = {};
                _.each(keys, function (key) {
                    defaults[key] = model[key][1];
                });
                _.each(objects, function (item) {
                    _.each(keys, function(key) {
                        if (!_.isUndefined(item[key]) && typeof item[key] != model[key][0]) {

                            var validType = model[key][0];
                            if (_.isObject(model[key][0]) && !_.isString(model[key][0])) {
                                validType = "object";
                            }

                            if (_.isObject(model[key][0]) && !_.isString(model[key][0]) && _.isArray(item[key])) {
                                processModelPart(item[key], model[key][0]);
                            } else {
                                if (_.isArray(item[key]) && item[key].length > 0) {
                                    item[key] = item[key][0];
                                }

                                if (typeof item[key] != model[key][0]) {

                                    // let's fix some cases
                                    switch (model[key][0]) {
                                        case "array":
                                            item[key] = [item[key]];
                                            break;
                                        case "number":
                                            item[key] = Number(item[key]);
                                            break;
                                        case "string":
                                            item[key] = item[key].toString();
                                            break;
                                    }
                                }
                            }
                        }
                    });
                    _.defaults(item, defaults); // fill in default values
                    var trailingKeys = _.difference(_.keys(item), keys); // omit unwanted fields
                    _.each(trailingKeys, function(key) {
                        delete item[key];
                    })
                });
            };

            processModelPart(response["@graph"], model);

        }
        catch (e) {
            console.error(e);
            throw new Error("Unable to process model", e);
        }

        return response;
    };

    // Shortens long URIs in defined properties
    this.processPrefixedProperties = function(response, sparqlEndpoint) {

        if (!this.getReplacePrefixes() || !_.isArray(response["@graph"])) // do not apply prefixed properties
            return response;

        var deferred = Q.defer();

        prefixesManager.getReplacer(sparqlEndpoint)
            .then(function(replacer) {

                var processed = [];

                var prefixArray = function(objects, processed) {
                    _.each(objects, function(obj) {
                        if (_.isObject(obj)) {
                            var newObj = {};
                            processed.push(newObj);
                            prefixObject(obj, newObj);
                        } else {
                            processed.push(obj); // scalar type
                        }
                    })
                };

                var prefixObject = function(obj, newObj) {
                    _.each(obj, function(values, predicate) {
                        if (predicate == '@id') {
                            newObj['@id'] = replacer.contract(values);
                        } else if (predicate == '@type') {
                            if (_.isArray(values)) {
                                newObj['@type'] = _.map(values, function (value) {
                                    return replacer.contract(value);
                                });
                            } else {
                                newObj['@type'] = [ replacer.contract(values) ];
                            }
                        } else {
                            if (!_.startsWith(predicate, '@')) {
                                predicate = replacer.contract(predicate);
                            }
                            if (_.isArray(values)) {
                                var newArray = [];
                                newObj[predicate] = newArray;
                                prefixArray(values, newArray);
                            } else {
                                newObj[predicate] = values;
                            }
                        }
                    });
                };

                prefixArray(response['@graph'], processed);

                response["@graph"] = processed;

                deferred.resolve(response);

            })
            .done();

        return deferred.promise;
    };
}

/**
 * Provider for JSON-LD @context
 * http://www.w3.org/TR/json-ld/#the-context
 * If false is returned, no context operations will be performed
 * @return {object|boolean} definition of JSON-LD context OR false
 */
SparqlQueryAdapter.prototype.getContext = function() {
    return config.queryAdapter.defaultContext;
};
// Indicates whether or not convert dates in JSON-LD response
SparqlQueryAdapter.prototype.getConvertDates = function() {
    return config.queryAdapter.dates.convert;
};
// Returns key suffix for converted day values
SparqlQueryAdapter.prototype.getDateSuffix = function() {
    return config.queryAdapter.dates.suffix;
};
// Returns set of RDF types of date objects to convert
SparqlQueryAdapter.prototype.getDateInputTypes = function() {
    return config.queryAdapter.dates.inputTypes;
};
// Returns date formats to parse date values with
SparqlQueryAdapter.prototype.getDateInputFormats = function() {
    return config.queryAdapter.dates.inputFormats;
};
// Return new date output format
SparqlQueryAdapter.prototype.getDateOutputFormat = function() {
    return config.queryAdapter.dates.outputFormat;
};
// Indicates whether or not to convert graph in JSON-LD
// response specified with multiple objects into one object
SparqlQueryAdapter.prototype.getReconstructComplexObjects = function() {
    return config.queryAdapter.reconstructComplexObjects;
};
/**
 * Modification of JSON-LD response
 * @param {object} response data in JSON-LD format
 * @return {object} modified data in JSON-LD format OR a promise
 */
SparqlQueryAdapter.prototype.prepareResponse = function(response, requestParams) {
    return response;
};
/**
 * Returns a data model OR false not to apply the model
 * @returns {object|boolean}
 */
SparqlQueryAdapter.prototype.getModel = function() {
    return config.queryAdapter.defaultModel;
};
/**
 * Returns list of properties to shorten resource URIs with OR
 * true - all properties will be shorten
 * false - no properties will be shorten
 * @returns {boolean}
 */
SparqlQueryAdapter.prototype.getReplacePrefixes = function() {
    return config.queryAdapter.replacePrefixes;
};
/**
 * Returns a collection of parameters to be injected into the associated SPARQL query
 * @param sparqlParams
 * @returns {object}
 */
SparqlQueryAdapter.prototype.prepareParams = function(sparqlParams) {
    return sparqlParams;
};


module.exports = SparqlQueryAdapter;
