(function() {

    'use strict';

    angular.module('app.services')

        .service('Search', ['$rootScope', '$http', '$q', 'CurrentStateHelper',
            function Search($rootScope, $http, $q, CurrentStateHelper) {

                this.search = function(query, types, properties, graphs, limit, offset) {
                    var deferred = $q.defer();
                    $http.get('/api/search', { params: {
                        endpoint: CurrentStateHelper.getCurrentEndpoint().alias,
                        query: query,
                        "types[]": types,
                        "properties[]": properties,
                        "graphs[]": graphs,
                        limit: limit,
                        offset: offset
                    }})
                        .success(function(data) {
                            deferred.resolve(data);
                        })
                        .error(function(error) {
                            deferred.reject();
                        });
                    return deferred.promise;
                }

            }
        ]);

})();