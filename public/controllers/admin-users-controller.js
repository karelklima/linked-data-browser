(function() {

    angular.module('app.controllers')

        .controller('AdminUsersController', ['$scope', '$rootScope', '$http', 'User', 'lodash', 'toastr',
            function($scope, $rootScope, $http, User, _, toastr) {
                var self = this;

                $scope.numberOfAdmins = 0;

                User.getAll().then(function(users) {
                    $scope.numberOfAdmins = _(users).filter(function(o) {
                        return o.roles.indexOf('admin') >= 0;
                    }).size();
                    $scope.users = _(users).map(function(user) {
                        user.isAdmin = user.roles.indexOf('admin') >= 0;
                        user.roles = user.roles.replace(' ', ', ');
                        return user;
                    }).value();
                });

                $scope.makeAdmin = function(user) {

                    toastr.info("Clicked makeAdmin");

                    var u = user;

                    return false;

                };

                $scope.revokeAdmin = function(user) {

                    var e = event;
                    var u = user;
                };

                $scope.remove = function(user) {
                    User.remove({
                        id: user.id
                    })
                        .then(function() {
                            _.remove($scope.users, {id: user.id});
                        });
                }

            }
        ]);

})();