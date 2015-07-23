(function() {

    'use strict';

    angular.module('app.services')

        .service('Miniapp', ['$rootScope', 'View', 'lodash',
            function Miniapp($rootScope, View, _) {

                this.decorateScope = function(scope) {

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
                    scope.$instance =  dataScope.$miniapp.instance;
                    scope.$resource = scope.$graph['@id'];
                    if (scope.$instance.property && scope.$instance.relation) {
                        scope.$property = _.find(scope.$graph.property, {
                            '@id': scope.$instance.property,
                            'relation': scope.$instance.relation
                        });
                    }

                };

            }
        ]);

})();