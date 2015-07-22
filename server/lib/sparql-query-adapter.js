/**
 * SPARQL ROUTE JSONLD
 */

var jsonld = require('jsonld');
var _ = require('lodash');
var Q = require('q');
var moment = require('moment');

var config = require('../../config');
var prefixesManager = require('./prefixes-manager');
var ToasterError = require('./toaster-error');

/**
 * SparqlQueryAdapter
 * SPARQL query support in JSON-LD format
 * @constructor
 */
function SparqlQueryAdapter() {

    var self = this;

    // Override of SparqlRoute.handleResponse
    this.handleResponse = function(responseString, requestParams, sparqlEndpoint) {

        // Initiate main workflow
        return Q()
            .then(function () {
                if (!_.startsWith(responseString, '{')) {
                    throw new ToasterError("Invalid SPARQL query issued", 500, responseString);
                }
                return responseString;
            })
            .then(function (r) {
                return JSON.parse(responseString);
            })
            .then(function (r) {
                return self.applyAdvancedContext(r);
            })
            .then(function (r) {
                return self.applyContext(r);
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
            });

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
    this.applyAdvancedContext = function(response) {
        var context = this.getAdvancedContext();
        if (!context) {
            return response;
        }

        response = self.fixRDFType(response);

        var p = jsonld.promises();
        return p.compact(response, this.getAdvancedContext(), config.queryAdapter.compactOptions)
            .then(function(response) {
                return self.fixJSONLDType(response);
            });
    };

    // Converts @type properties to array - jsonld bug fix
    this.fixJSONLDType = function(response) {
        if (!_.has(response, "@graph"))
            return response;

        var graph = response["@graph"];
        _.each(response["@graph"], function(item) {
            if (_.has(item, "@type") && !_.isArray(item["@type"])) {
                item["@type"] = [item["@type"]];
            }
        });

        return response;
    };

    // Renames URIs as keys in objects with defined values
    this.applyContext = function(response) {
        var context = this.getContext();

        if (!context || !_.has(response, "@graph")) {
            return response;
        }

        function RenameKey(object ) {}

        context = _.invert(context);

        response["@graph"] = _.map(response["@graph"], function(object) {
            return _.mapKeys(object, function(value, originalKey) {
                if (_.has(context, originalKey)) {
                    return context[originalKey];
                }
                return originalKey;
            });
        });

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

        var typeCheckers = {
            string: _.isString,
            number: _.isNumber,
            boolean: _.isBoolean,
            array: _.isArray,
            object: _.isPlainObject
        };

        var typeConverters = {
            string: function(v) { return String(v); },
            number: function(v) { return Number(v); },
            boolean: function(v) { return Boolean(v); },
            array: function(v) { return [v]; },
            object: function(v) { return { value: v }; }
        };

        function checkType(value, type) {
            if (!_.isFunction(typeCheckers[type])) {
                throw new Error("Invalid type of data provided in JSON-LD model: " + type);
            }
            return(typeCheckers[type](value));
        }

        function processModelKey(key, spec, object) {
            if (!_.has(object, key)) {
                object[key] = spec[1];
            } else if (!checkType(object[key], spec[0])) {
                // basic converters
                if (spec[0] == 'array') {
                    object[key] = typeConverters['array'](object[key]); // literal to array
                } else if (spec[0] == 'object') {
                    object[key] = typeConverters['object'](object[key]); // literal to object
                } else if (checkType(object[key], 'array')) {
                    if (object[key].length > 0) {
                        object[key] = typeConverters[spec[0]](object[key][0]); // array to literal
                    } else {
                        object[key] = spec[1]; // default value
                    }
                } else {
                    object[key] = typeConverters[spec[0]](object[key]); // convert whatever it is remaining
                }
            }
        }

        function processModelPart(objects, model) {
            var keys = _.keys(model);
            _.forEach(objects, function(object) {
                _.forEach(keys, function(key) {
                    if (_.isString(model[key][0])) {
                        // processing key
                        processModelKey(key, model[key], object);
                    } else {
                        // next level
                        if (!_.isPlainObject(model[key][0])) {
                            throw new Error("Invalid JSON-LD model specification for key: " + key);
                        }
                        if (_.isArray(object[key])) {
                            processModelPart(object[key], model[key][0]); // standard processing
                        } else if (_.isPlainObject(object[key])) {
                            processModelPart([object[key]], model[key][0]); // expand to array
                        } else {
                            // different value than expected or empty, replace with default value
                            object[key] = model[key][1]; //
                        }
                    }
                });
                var trailingKeys = _.difference(_.keys(object), keys); // omit unwanted fields
                _.each(trailingKeys, function(key) {
                    delete object[key];
                })
            })
        }

        processModelPart(response["@graph"], model);

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
SparqlQueryAdapter.prototype.getAdvancedContext = function() {
    return config.queryAdapter.defaultAdvancedContext;
};
// Returns an object of prefixes and URIs to replace in JSON-LD response
SparqlQueryAdapter.prototype.getContext = function() {
    return config.queryAdapter.defaultContext;
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
