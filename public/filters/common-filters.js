(function() {

    angular.module('app.filters')

        .filter('join', ['lodash', function(_) {
            return function(input, separator) {
                if (!_.isString(input) && !_.isArray(input)) {
                    return input;
                }
                if (!_.isArray(input)) {
                    input = input.split(' ');
                }
                separator = separator || ', ';
                return input.join(separator);
            };
        }])

        .filter('boolean', ['lodash', function(_) {
            return function(input) {
                return input ? 'Yes' : 'No';
            };
        }])

})();