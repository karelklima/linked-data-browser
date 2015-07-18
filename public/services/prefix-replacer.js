(function() {

    'use strict';

    angular.module('app.services')

        .factory('PrefixReplacer', ['$rootScope', '$http', '$state', 'store', '$q', 'toastr', 'lodash',
            function ($rootScope, $http, $state, store, $q, toastr, _) {

                function PrefixReplacer() {



                }

                return new Config();
            }
        ]);

})();