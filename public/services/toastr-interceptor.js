(function() {

    'use strict';

    angular.module('app.services')

        .service('ToastrInterceptor', ['$rootScope', '$q', 'lodash', function ($rootScope, $q, _) {

            function processToasts(response) {
                if (_.isObject(response.data) && _.isArray(response.data.toasts)) {
                    _.forEach(response.data.toasts, function (toast) {
                        $rootScope.$emit('toast', toast);
                    });
                    response.data = _.omit(response.data, 'toasts');
                }
                return response;
            }

            this.response = processToasts;

            this.responseError = function(response) {
                return $q.reject(processToasts(response));
            };

        }]);

})();