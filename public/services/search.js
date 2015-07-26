(function() {

    'use strict';

    angular.module('app.services')

        .service('Search', ['$rootScope', '$http', '$q', 'State',
            function Search($rootScope, $http, $q, State) {

                this.search = function(query, types, properties, graphs, limit, offset) {
                    var deferred = $q.defer();
                    $http.get('/api/search', { params: {
                        endpoint: State.getEndpoint().alias,
                        query: query,
                        "types[]": types,
                        "properties[]": properties,
                        "endpoint-param-default-graph-uri[]": graphs,
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