(function() {

    angular.module('app.miniapps')

        .controller('OrganizationPropertyController', ['$scope', 'Miniapp', 'lodash', 'Describe',
            function($scope, Miniapp, _, Describe) {

                Miniapp.decorateScope($scope);

                $scope.organizationLoaded = false;

                Miniapp.request('/api/organization-property', { resource: $scope.$property.data[0]['@id'] })
                    .then(function(data) {
                        if (data['@graph'].length == 1) {
                            // only execute if there is a successful result
                            $scope.$property.data = data['@graph'];
                            $scope.organizationLoaded = true;
                        }
                    });


            }
        ]);

})();