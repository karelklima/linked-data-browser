(function() {

    angular.module('app.controllers')

        .controller('AdminViewsController', ['$scope', '$http', '$state', 'View', 'lodash',
            function($scope, $http, $state, View, _) {

                View.getAll().then(function(views) {
                    views = _.map(views, function(view) {
                        return view;
                    });
                    $scope.views = views;
                    $scope.displayedViews = views;
                });

                $scope.edit = function(view) {

                    $state.go('root.describe.edit', { resource: view.referenceUri });

                };

                $scope.remove = function(view) {
                    View.remove({
                        id: view.id
                    })
                        .then(function() {
                            _.remove($scope.views, {id: view.id});
                        });
                }

            }
        ]);

})();