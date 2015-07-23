(function() {

    angular.module('app.filters')

        .filter('truncateUri', ['lodash', function(_) {

            var uriRegex = /^(http:\/\/[a-z0-9.:]+\/)(.*)(\/[^\/]+.{10,15}(\/)?$)/;

            return function(input) {
                if (!_.isString(input) || !_.startsWith(input, 'http://')) {
                    return input;
                }
                return input.replace(uriRegex, function(m1, m2, m3, m4) {
                    if (m4.length > 15) {
                        m4 = m4.substring(m4.length-15);
                    }
                    return m2 + '...' + m4;
                });
            };
        }])

        .filter('truncateUriLarge', ['lodash', function(_) {

            var uriRegex = /^(http:\/\/[a-z0-9.:]+\/)(.*)(\/[^\/]+.{40,45}(\/)?$)/;

            return function(input) {
                if (!_.isString(input) || !_.startsWith(input, 'http://')) {
                    return input;
                }
                return input.replace(uriRegex, function(m1, m2, m3, m4) {
                    return m2 + '...' + m4;
                });
            };
        }])

        .filter('id', ['lodash', function(_) {
            return function(input) {
                if (_.isArray(input)) {
                    return _.map(input, function(i) {
                        if (_.has(i, '@id')) {
                            return i['@id'];
                        }
                        return i;
                    });
                }
                if (_.has(input, '@id')) {
                    return input['@id'];
                }
                return input;
            };
        }])

        .filter('value', ['lodash', 'State', function(_, State) {
            function localizedValue(arrayInput) {
                if (arrayInput.length < 1) {
                    return false;
                }
                var localized = _.find(arrayInput, { '@language': State.getLanguage().alias });
                if (localized) {
                    return localized['@value'];
                }
                var out = arrayInput[0];
                return _.isPlainObject(out) ? out['@value'] : out;
            }
            return function(input) {
                if (_.isPlainObject(input)) {
                    if (_.has(input, '@value')) {
                        return input['@value'];
                    }
                    return input;
                } else if (_.isArray(input)) {
                    var localized = localizedValue(input);
                    return localized ? localized : input; // just in case
                }
                if (_.has(input, '@value')) {
                    return input['@value'];
                }
                return input;
            };
        }])

        .filter('label', ['lodash', '$filter', function(_, $filter) {
            var contract = $filter('contract');
            var expand = $filter('expand');
            var value = $filter('value');
            var labelProperties = [
                "label",
                "rdfs:label",
                "foaf:name",
                "dcterms:title",
                "skos:prefLabel"
            ];

            function getLabel(input) {
                var label = false;
                _.forEach(labelProperties, function(labelProperty) {
                    if (_.has(input, labelProperty)) {
                        label = value(input[labelProperty]);
                        return false; // exit loop
                    }
                    labelProperty = expand(labelProperty); // try again with full URI
                    if (_.has(input, labelProperty)) {
                        label = value(input[labelProperty]);
                        return false; // exit loop
                    }
                });
                return label;
            }

            return function(input) {
                var label = getLabel(input);
                if (label != false) {
                    return label;
                } else if (_.has(input, '@id')) {
                    return contract(input['@id']);
                }
                return input;
            };
        }])

        .filter('contract', ['PrefixesReplacer', 'lodash', '$filter', function(PrefixesReplacer, _, $filter) {
            var truncateUri = $filter('truncateUri');
            function contract(value) {
                var contracted = PrefixesReplacer.contract(value);
                // if the prefix did not get replaced, at least truncate the URI
                if (_.isEqual(value, contracted)) {
                    contracted = truncateUri(contracted);
                }
                return contracted;
            }

            return function(input) {
                if (_.isArray(input)) {
                    return _.map(input, function(i) {
                        return contract(i)
                    });
                }
                return contract(input);
            };
        }])

        .filter('expand', ['PrefixesReplacer', 'lodash', function(PrefixesReplacer, _) {
            return function(input) {
                if (_.isArray(input)) {
                    return _.map(input, function(i) {
                        return PrefixesReplacer.expand(i)
                    });
                }
                return PrefixesReplacer.expand(input);
            };
        }])

        .filter('extract', ['lodash', function(_) {
            return function(input, key) {
                if (!_.isArray(input)) {
                    input = [input];
                }
                return _.map(input, function(object) {
                    _.pick(object, key);
                });
            };
        }]);



})();