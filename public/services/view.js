(function() {

    'use strict';

    angular.module('app.services')

        .service('View', ['$rootScope', '$http', '$q', 'lodash', 'Config',
            function View($rootScope, $http, $q, _, Config) {

                this.create = function(viewData) {
                    var deferred = $q.defer();
                    $http.post('/api/views', viewData)
                        .success(function(data) {
                            $rootScope.$broadcast('view-created');
                            deferred.resolve(data);
                        })
                        .error(function() {
                            $rootScope.$broadcast('view-creation-failed');
                            deferred.reject();
                        });

                    return deferred.promise;
                };

                this.remove = function(viewData) {
                    var deferred = $q.defer();
                    $http.delete('/api/views', { params: viewData })
                        .success(function(data) {
                            $rootScope.$broadcast('view-removed', viewData);
                            deferred.resolve();
                        })
                        .error(function() {
                            $rootScope.$broadcast('view-removal-failed', viewData);
                            deferred.reject();
                        });

                    return deferred.promise;
                };

                this.update = function(viewData) {
                    var deferred = $q.defer();
                    $http.put('/api/views', viewData)
                        .success(function(data) {
                            $rootScope.$broadcast('view-updated', viewData);
                            deferred.resolve();
                        })
                        .error(function() {
                            $rootScope.$broadcast('view-update-failed', viewData);
                            deferred.reject();
                        });
                    return deferred.promise;
                };

                this.getAll = function() {
                    var deferred = $q.defer();
                    $http.get('/api/views')
                        .success(function(data) {
                            deferred.resolve(data);
                        })
                        .error(function() {
                            deferred.reject();
                        });
                    return deferred.promise;
                };

                this.expand = function(viewDefinition) {
                    viewDefinition = _.cloneDeep(viewDefinition); // keep the original object intact
                    viewDefinition.layout = _.clone(Config.getLayoutProfile(viewDefinition.layout));
                    _.forEach(_.keys(viewDefinition.panels), function(panel) {
                        viewDefinition.panels[panel] = _.map(viewDefinition.panels[panel], function(miniappDefinition) {
                            miniappDefinition.miniapp = _.clone(Config.getMiniappProfile(miniappDefinition.miniapp));
                            return miniappDefinition;
                        })
                    });
                    return viewDefinition;
                };

                this.contract = function(viewDefinition) {
                    viewDefinition = _.cloneDeep(viewDefinition); // keep the original object intact
                    viewDefinition.layout = viewDefinition.layout.id;
                    _.forEach(_.keys(viewDefinition.panels), function(panel) {
                        viewDefinition.panels[panel] = _.map(viewDefinition.panels[panel], function(miniappDefinition) {
                            miniappDefinition.miniapp = miniappDefinition.miniapp.id;
                            delete miniappDefinition['$$hashKey'];
                            return miniappDefinition;
                        })
                    });
                    return viewDefinition;
                };

                this.extractMiniapps = function(viewDefinition) {
                    viewDefinition = _.cloneDeep(viewDefinition); // keep the original object intact
                    var miniapps = [];
                    _.forEach(_.keys(viewDefinition.panels), function(panel) {
                        _.forEach(viewDefinition.panels[panel], function(miniappDefinition) {
                            delete miniappDefinition['$$hashKey'];
                            miniapps.push(miniappDefinition);
                        })
                    });
                    return miniapps;
                };

                this.generate = function(layout, miniapps) {
                    var panels = {};
                    _.forEach(layout.panels, function(panel) {
                        panels[panel] = [];
                    });
                    panels[layout.defaultPanel] = miniapps;
                    return {
                        layout: layout,
                        panels: panels
                    };
                }


            }
        ]);

})();