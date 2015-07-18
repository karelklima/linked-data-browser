(function() {

    angular.module('app.directives')

    /**
     * Normal-size loading indicator
     */
        .directive('loadingBar', function() {
            return {
                restrict: 'AE',
                replace: true,
                transclude: true,
                template: '<div class="well well-lg loading-bar"><div class="loading-label">LOADING</div><div class="loading-spinner"></div></div>'
            }
        })

    /**
     * Small loading indicator
     */
        .directive('spinnerGlyphicon', function() {
            return {
                restrict: 'A',
                replace: true,
                transclude: true,
                template: '<span class="glyphicon glyphicon-spinner"><span spinner="{radius:6, width:2, length: 0, shadow: false, color: \'#333\', trail: 40, lines: 11}"></span></span>'
            }
        })

    /**
     * Paging directive
     */
        .directive('datapager', function() {
            return {
                restrict: 'A',
                replace: true,
                scope: {
                    source: '=',
                    target: '=',
                    itemsPerPage: '@',
                    hideControls: '@'
                },
                template:
                "<div class=\"text-center\" ng-show=\"showControls && !source.isEmpty\">\n" +
                "  <a class=\"btn btn-default pull-left\" ng-click=\"previousPage()\" ng-class=\"{disabled: isLoading || page < 1}\">Previous</a>\n" +
                "  <a class=\"btn btn-default pull-right\" ng-click=\"nextPage()\" ng-class=\"{disabled: isLoading || page >= maxPage}\">Next</a>\n" +
                "  <a class=\"btn btn-primary\" ng-click=\"appendPage()\" ng-class=\"{disabled: isLoading || page >= maxPage}\">\n" +
                "    <span ng-hide=\"isLoading\">More</span><span ng-show=\"isLoading\">Loading</span>\n" +
                "  </a>\n" +
                "</div>",
                link: function(scope, element, attrs) {

                    if (angular.isUndefined(scope.source)
                        || !angular.isFunction(scope.source.get)) {
                        throw new Error("Datapager: data source is not valid");
                    }

                    scope.limit = scope.itemsPerPage;
                    if (angular.isUndefined(scope.limit) || scope.limit < 1)
                        scope.limit = 10; // default page size

                    scope.showControls = angular.isUndefined(scope.hideControls) || scope.hideControls != "true";

                    scope.page = 0;
                    scope.maxPage = 1000;
                    scope.append = false;
                    scope.target = [];

                    scope.source.isEmpty = false;
                    scope.source.isLoading = false;

                    /** Show next page. */
                    scope.appendPage = function() {
                        scope.append = true;
                        scope.page++;
                        scope.update();
                    };

                    /** Show next page. */
                    scope.nextPage = function() {
                        scope.page++;
                        scope.update();
                    };
                    /** Show previous page. */
                    scope.previousPage = function() {
                        scope.page--;
                        scope.update();
                    };

                    /** Full update of current directive on datasource changing. */
                    scope.$watch('source', function(current, previous) {
                        if (angular.isUndefined(current.revision) || current.revision == previous.revision)
                            return; // do not refresh
                        scope.target = [];
                        scope.page = 0;
                        scope.maxPage = 1000;
                        scope.update()
                    }, true);

                    /** Update current state and view. */
                    scope.update = function() {
                        scope.source.isLoading = true;
                        scope.source.isEmpty = false;
                        if (!scope.append)
                            scope.target = [];
                        else
                            scope.append = false;

                        var originalRevision = scope.source.revision;

                        scope.source.get(scope.page * scope.limit, scope.limit, function(data) {
                            if (scope.source.revision !== originalRevision) {
                                return; // newer datasource is already in place
                            }
                            // if (data.length < scope.limit) CONSTRUCT query fix
                            if (data.length == 0)
                                scope.maxPage = scope.page;
                            if (data.length == 0 && scope.maxPage == 0)
                                scope.source.isEmpty = true;
                            scope.target.push.apply(scope.target, data);
                            scope.source.isLoading = false;
                        });
                    };

                    scope.update(); // initial load

                }
            }
        });



})();