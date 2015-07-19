(function() {

    angular.module('app.filters')

        .filter('truncateUri', ['lodash', function(_) {

            var uriRegex = /^(http:\/\/[a-z0-9.:]+\/)(.*)(\/[^\/]+.{10,15}(\/)?$)/;

            return function(input) {
                if (!_.isString(input) || !_.startsWith(input, 'http://')) {
                    return input;
                }
                return input.replace(uriRegex, function(m1, m2, m3, m4) {
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
                if (_.has(input, '@id')) {
                    return input['@id'];
                }
                return input;
            };
        }])

        .filter('contract', ['PrefixesReplacer', 'lodash', function(PrefixesReplacer, _) {
            return function(input) {
                if (_.isArray(input)) {
                    var r = _.map(input, function(i) {
                        return PrefixesReplacer.contract(i)
                    })
                    console.log(r);
                    console.log(input);
                    return r;
                }
                return PrefixesReplacer.contract(input);
            };
        }])

        .filter('expand', ['PrefixesReplacer', 'lodash', function(PrefixesReplacer, _) {
            return function(input) {
                if (_.isArray(input)) {
                    return _.map(input, function(i) {
                        return PrefixesReplacer.expand(i)
                    })
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