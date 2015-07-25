(function() {

    angular.module('app.miniapps')

        .controller('SPostalAddressController', ['$scope', 'Miniapp', 'lodash', 'Describe',
            function($scope, Miniapp, _, Describe) {

                Miniapp.decorateScope($scope);

                $scope.addressesLoaded = false;

                var properties = ["http://schema.org/streetAddress", "http://schema.org/addressLocality", "http://schema.org/postalCode"];

                Describe.describeProperty($scope.$resource, $scope.$instance, 5, 0, properties)
                    .then(function(data) {
                        var miss = false;
                        var sample = data.data[0];
                        // safety guard in case that the current property actually does not have properties of s:PostalAddress
                        _.forEach(properties, function(property) {
                            if (!_.has(sample, property)) {
                                miss = true;
                                return false; // exit loop
                            }
                        });
                        if (!miss) {
                            $scope.$property = data;
                            $scope.addressesLoaded = true;
                        }
                    });

                $scope.showMore = function() {
                    $scope.more = true;
                };

                $scope.results = [];

                $scope.datasource = {
                    get: function(offset, limit) {
                        return Describe.describeProperty($scope.$resource, $scope.$instance, limit, offset, properties)
                            .then(function(data) {
                                return data.data;
                            });
                    }
                };


            }
        ]);

})();