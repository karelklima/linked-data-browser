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



})();