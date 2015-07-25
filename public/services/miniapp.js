(function() {

    'use strict';

    angular.module('app.services')

        .service('Miniapp', ['$rootScope', '$http', 'View', 'lodash', 'State',
            function Miniapp($rootScope, $http, View, _, State) {

                this.decorateScope = function (scope) {

                    var dataScope = scope.$parent;
                    while (dataScope != null) {
                        if (dataScope.$miniapp != null && dataScope.$viewDefinition != null) {
                            break;
                        }
                        dataScope = dataScope.$parent;
                    }
                    if (dataScope == null) {
                        throw new Error("Unable to locate parent data scope");
                    }

                    scope.$graph = dataScope.$viewDefinition.$graph;
                    scope.$instance = dataScope.$miniapp.instance;
                    scope.$resource = scope.$graph['@id'];
                    if (scope.$instance.property && scope.$instance.relation) {
                        scope.$property = _.find(scope.$graph.property, {
                            '@id': scope.$instance.property,
                            'relation': scope.$instance.relation
                        });
                    }

                };

                this.request = function (api, params) {
                    console.log(params);
                    params = params || {};
                    console.log(params);
                    params.endpoint = State.getEndpoint().alias;
                    return $http.get(api, {params: params})
                        .then(function(result) {
                            return result.data;
                        });
                };

            }
        ]);

})();