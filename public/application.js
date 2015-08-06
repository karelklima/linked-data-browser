/// <reference path="../typings/tsd.d.ts"/>

(function() {

    angular.module('app.controllers', []);

    angular.module('app.services', []);

    angular.module('app.filters', []);

    angular.module('app.directives', []);

    angular.module('app.layouts', []);

    angular.module('app.miniapps', []);

    angular.module('app', [
        'app.controllers',
        'app.services',
        'app.filters',
        'app.directives',
        'app.layouts',
        'app.miniapps',
        'ui.router',
        'ui.bootstrap',
        'ui.select',
        'ui.sortable',
        'angular-jwt',
        'angular-storage',
        'ngCookies',
        'ngAnimate',
        'ngSanitize',
        'ngLodash',
        'angular-loading-bar',
        'toastr',
        'smart-table'
    ])

        // Routing
        .config(['$stateProvider', '$urlRouterProvider', '$urlMatcherFactoryProvider', 'lodash',
            function($stateProvider, $urlRouterProvider, $urlMatcherFactoryProvider, _){

                $urlRouterProvider.when('', '/');
                $urlRouterProvider.otherwise(function(injector, location){
                    var state = injector.get('$state');
                    state.go('404');
                    return location.path();
                });


                // FIX of UI Router slash encoding bug - override of the string type
                function valToString(val) { return val != null ? val.toString().replace(/\//g, "%2F") : val; }
                function valFromString(val) { return val != null ? val.toString().replace(/%2F/g, "/") : val; }
                $urlMatcherFactoryProvider.type('string', {
                    encode: valToString,
                    decode: valFromString,
                    is: function(val) { return val == null || !angular.isDefined(val) || typeof val === "string"; },
                    $normalize: function(val){
                        return this.decode(val);
                    },
                    pattern: /[^/]*/
                });
                function uriToString(val) {
                    return angular.toJson({"@id":val});
                }
                function uriFromString(val) {
                    if (!_.startsWith(val, "{")) {
                        return val;
                    }
                    return angular.fromJson(val)["@id"];
                }
                $urlMatcherFactoryProvider.type('uri', {
                    encode: uriToString,
                    decode: uriFromString,
                    //is: angular.isObject,
                    is: function(val) { return val == null || !angular.isDefined(val) || typeof val === "string"; },
                    equals: angular.equals,
                    $normalize: function(val){ return this.decode(val); },
                    pattern: /[^/]*/
                });

                $stateProvider
                    .state('error', {
                        templateUrl: '/public/views/error.html'
                    })
                    .state('404', {
                        templateUrl: '/public/views/error-404.html'
                    })
                    .state('root', {
                        abstract: true,
                        templateUrl: '/public/views/root.html',
                        controller: 'RootController',
                        resolve: {
                            configPromise: ['Config', function(Config) {
                                return Config.reload();
                            }]
                        }
                    })
                    .state('root.home', {
                        url: '/',
                        templateUrl: '/public/views/home.html'
                    })
                    .state('root.login', {
                        url: '/login',
                        templateUrl: '/public/views/login.html'
                    })
                    .state('root.register', {
                        url: '/register',
                        templateUrl: '/public/views/register.html'
                    })
                    .state('root.profile', {
                        url: '/profile',
                        templateUrl: '/public/views/profile.html',
                        data: {
                            requiresLogin: true
                        }
                    })
                    .state('root.admin', {
                        abstract: true,
                        url: '/admin',
                        templateUrl: '/public/views/admin.html',
                        data: {
                            requiresAdmin: true
                        }
                    })
                    .state('root.admin.endpoints', {
                        url: '/endpoints',
                        templateUrl: '/public/views/admin-endpoints.html'
                    })
                    .state('root.admin.languages', {
                        url: '/languages',
                        templateUrl: '/public/views/admin-languages.html'
                    })
                    .state('root.admin.users', {
                        url: '/users',
                        templateUrl: '/public/views/admin-users.html'
                    })
                    .state('root.admin.miniapps', {
                        url: '/miniapps',
                        templateUrl: '/public/views/admin-miniapps.html'
                    })
                    .state('root.admin.views', {
                        url: '/views',
                        templateUrl: '/public/views/admin-views.html'
                    })
                    .state('root.search', {
                        url: '/search?query&endpoint&language',
                        templateUrl: '/public/views/search.html'
                    })
                    .state('root.describe', {
                        abstract: true,
                        templateUrl: '/public/views/describe.html'
                    })
                    .state('root.describe.formatted', {
                        url: '/describe?{resource:uri}&endpoint&language',
                        templateUrl: '/public/views/describe-formatted.html'
                    })
                    .state('root.describe.raw', {
                        url: '/describe-raw?{resource:uri}&endpoint&language',
                        templateUrl: '/public/views/describe-raw.html'
                    })
                    .state('root.describe.edit', {
                        url: '/describe-edit?{resource:uri}&endpoint&language',
                        templateUrl: '/public/views/describe-edit.html',
                        data: {
                            requiresAdmin: true
                        }
                    });

        }])

        // All events logger
        // TODO remove in the end
        .config(['$provide', 'lodash', function ($provide, _) {
            $provide.decorator('$rootScope', ['$delegate', function ($delegate) {
                var _emit = $delegate.$emit;
                $delegate.$emit = function () {
                    if (!_.startsWith(arguments[0], '$') && !_.startsWith(arguments[0], 'cfp')) {
                        console.log("EMIT:");
                        console.log.apply(console, arguments);
                    }
                    return _emit.apply(this, arguments);
                };

                var _broadcast = $delegate.$broadcast;
                $delegate.$broadcast = function () {
                    if (!_.startsWith(arguments[0], '$') && !_.startsWith(arguments[0], 'cfp')) {
                        console.log("BROADCAST:");
                        console.log.apply(console, arguments);
                    }
                    return _broadcast.apply(this, arguments);
                };

                return $delegate;
            }]);
        }])

        // Inject auth token into $http requests
        .config(['jwtInterceptorProvider', '$httpProvider', function(jwtInterceptorProvider, $httpProvider) {
            jwtInterceptorProvider.tokenGetter = ['store', function(store) {
                return store.get('jwt');
            }];
            $httpProvider.interceptors.push('jwtInterceptor');
        }])

        // notifications setup
        .config(['toastrConfig', function(toastrConfig) {
            angular.extend(toastrConfig, {
                extendedTimeOut: 1000,
                positionClass: '',
                timeOut: 1500,
                closeButton: false,
                closeHtml: '<button>&times;</button>',
                containerId: 'toasts-container',
                iconClasses: {
                    error: 'alert-danger',
                    info: 'alert-info',
                    success: 'alert-success',
                    warning: 'alert-warning'
                },
                maxOpened: 0,
                messageClass: 'toast-message',
                newestOnTop: true,
                tapToDismiss: true,
                titleClass: 'toast-title',
                toastClass: 'toast alert'
            });
        }])

        .config(['$httpProvider', function($httpProvider) {
            $httpProvider.interceptors.push('ToastrInterceptor');
        }])

        .run(['$rootScope', 'toastr', function($rootScope, toastr) {
            $rootScope.$on('toast', function(e, data) {
               switch (data.type) {
                   case 'error':
                       toastr.error(data.message, null, { timeOut: 3000});
                       break;
                   case 'info':
                       toastr.info(data.message);
                       break;
                   case 'success':
                       toastr.success(data.message);
                       break;
                   case 'warning':
                       toastr.warning(data.message, null, { timeOut: 3000});
                       break;
                   default:
                       toastr.error('Unidentified toast type detected');
                       break;
               }
            });
        }])

        .run(['$rootScope', '$state', '$injector', 'Identity', 'lodash', function($rootScope, $state, $injector, Identity, _) {
            $rootScope.$on('$stateChangeStart', function(e, to, toParams, fromState, fromParams) {
                if (to.data && to.data.requiresLogin && !Identity.isUser()) {
                    e.preventDefault();
                    $rootScope.$emit('toast', {
                        type: "error",
                        message: "User login required"
                    });
                    Identity.destroy();
                    $state.go('root.login');
                }

                if (to.data && to.data.requiresAdmin && !Identity.isAdmin()) {
                    e.preventDefault();
                    $rootScope.$emit('toast', {
                        type: "error",
                        message: "Admin privileges required"
                    });
                    $state.go('root.login');
                }

            });

            $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error){
                $state.go('error');
            });
        }])



})();