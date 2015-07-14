(function() {

    'use strict';

    angular.module('app.services')

        .factory('Identity', ['$rootScope', '$http', '$state', 'store', 'jwtHelper',
            function ($rootScope, $http, $state, store, jwtHelper) {

                function Identity() {

                    var self = this;
                    var profile = {};

                    verifyToken();
                    var token = getToken();
                    if (token) { // initial load of identity
                        load(token);
                    } else {
                        reset();
                    }

                    function verifyToken() {
                        var token = getToken();
                        if (token && !checkTokenValid(token)) {
                            destroyToken();
                            reset();
                        }
                    }

                    function getToken() {
                        return store.get('jwt') ? store.get('jwt') : false;
                    }

                    function setToken(token) {
                        store.set('jwt', token);
                    }

                    function decodeToken(token) {
                        return jwtHelper.decodeToken(token)
                    }

                    function checkTokenValid(token) {
                        var data = decodeToken(token);
                        return Math.floor(Date.now() / 1000) < data.exp;
                    }

                    function destroyToken() {
                        store.remove('jwt');
                    }

                    function reset() {
                        profile = {};
                    }

                    function data() {
                        return {
                            profile: profile,
                            isGuest: self.isGuest(),
                            isUser: self.isUser(),
                            isAdmin: self.isAdmin()
                        }
                    }

                    function load (token) {
                        var userProfile = jwtHelper.decodeToken(token);
                        profile = {
                            email: userProfile.email,
                            id: userProfile.id,
                            roles: userProfile.roles
                        };
                    }

                    this.getData = function() {
                        return data();
                    };

                    this.set = function(token) {
                        setToken(token);
                        load(token);
                        $rootScope.$broadcast('identity-set', data());
                    };

                    this.destroy = function() {
                        reset();
                        destroyToken();
                        $rootScope.$broadcast('identity-destroyed');
                    };

                    this.isGuest = function() {
                        return !this.isUser();
                    };

                    this.isUser = function() {
                        verifyToken();
                        return profile.roles ? profile.roles.indexOf('user') !== -1 : false;
                    };

                    this.isAdmin = function() {
                        verifyToken();
                        return profile.roles ? profile.roles.indexOf('admin') !== -1 : false;
                    };
                }

                return new Identity();
            }
        ]);

})();