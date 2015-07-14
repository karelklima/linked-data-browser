(function() {

    angular.module('app.controllers')

        .controller('AdminUsersController', ['$scope', '$http', 'User', 'lodash',
            function($scope, $http, User, _) {

                User.getAll().then(function(users) {
                    users = _.map(users, function(user) {
                        user.isAdmin = user.roles.indexOf('admin') != -1;
                        return user;
                    });
                    $scope.users = users;
                    $scope.displayedUsers = users;
                });

                $scope.makeAdmin = function(user) {

                    User.update({
                        id: user.id,
                        roles: "user admin"
                    })
                        .then(function() {
                            user.roles = "user admin";
                            user.isAdmin = true;
                        });

                };

                $scope.revokeAdmin = function(user) {

                    User.update({
                        id: user.id,
                        roles: "user"
                    })
                        .then(function() {
                            user.roles = "user";
                            user.isAdmin = false;
                        });
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