(function() {

    'use strict';

    angular.module('app.services')

        .service('PrefixesReplacer', ['$rootScope', 'Config', 'State', 'lodash',
            function PrefixesReplacer($rootScope, Config, State, _) {

                var prefixes = Config.getPrefixes();

                $rootScope.$on('config-loaded', function() {
                    prefixes = Config.getPrefixes();
                });

                function getCurrentPrefixes() {
                    return _.has(prefixes, State.getCurrentEndpoint().alias)
                    ? prefixes[State.getCurrentEndpoint().alias] : {}
                }

                this.expand = function(value)
                {
                    _.forEach(getCurrentPrefixes(), function(url, prefix) {
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
                    _.forEach(getCurrentPrefixes(), function(url, prefix) {
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
        ]);

})();