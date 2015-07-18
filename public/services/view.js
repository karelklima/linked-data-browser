(function() {

    'use strict';

    angular.module('app.services')

        .service('View', ['$rootScope', '$http', '$q', 'lodash', 'Config',
            function Describe($rootScope, $http, $q, _, Config) {

                var resourceGraph = null;
                var view = null;

                this.init = function(resourceGraphConfig, viewConfig) {
                    resourceGraph = resourceGraphConfig;
                    view = viewConfig;
                };

                this.getLayout = function() {
                    return Config.getLayoutProfile(view.layout);
                };

                this.getMiniapps = function(layoutPanel) {
                    if (!_.isArray(view.panels[layoutPanel])) {
                        console.log('invalid panel');
                        return [];
                    }
                    return _.map(view.panels[layoutPanel], function(miniapp) {
                        var profile = _.clone(Config.getMiniappProfile(miniapp.miniapp));
                        profile.instance = miniapp.instance;
                        profile.tracker = miniapp.miniapp + JSON.stringify(miniapp.instance);
                        return profile;
                    });
                };

                this.getInstance = function(scope) {
                    return scope.$parent.$parent.miniapp.instance;
                }

            }
        ]);

})();