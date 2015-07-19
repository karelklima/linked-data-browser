(function() {

    'use strict';

    angular.module('app.services')

        .service('Miniapp', ['$rootScope', 'View', 'lodash',
            function Miniapp($rootScope, View, _) {

                var self = this;

                this.decorateScope = function(scope) {
                    scope.$graph = self.getResourceGraph();
                    scope.$instance =  self.getInstance(scope);

                    scope.index = function() {
                        return scope.$parent.$index;
                    };
                    scope.isEven = function() {
                        return scope.$parent.$even;
                    };
                    scope.isOdd = function() {
                        return scope.$parent.$odd;
                    };
                    scope.isFirst = function() {
                        return scope.$parent.$first;
                    };
                    scope.isLast = function() {
                        return scope.$parent.$last;
                    };
                };

                this.getInstance = function(scope) {
                    return scope.$parent.$parent.$miniapp.instance;
                };

                this.getResourceGraph = function() {
                    return View.getResourceGraph();
                };

                this.getPropertyDescription = function(property, relation) {
                    return _.find(this.getResourceGraph().property, { '@id': property, relation: relation });
                }

            }
        ]);

})();