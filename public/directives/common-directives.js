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
         * Async data loader directive
         */
        .directive('dataloader', function() {
            return {
                restrict: 'A',
                replace: true,
                scope: {
                    source: '=',
                    target: '=',
                    loadMoreLabel: '@',
                    noMoreLabel: '@',
                    itemsPerPage: '@'
                },
                template:
                "<div class=\"text-center\" ng-show=\"!source.isEmpty\">\n" +
                "  <a class=\"btn btn-primary\" ng-click=\"appendPage()\" ng-class=\"{disabled: source.isLoading || hitEnd}\">\n" +
                "    <span ng-if=\"!hitEnd && !source.isLoading\">{{ loadMoreResolvedLabel }}</span><span ng-if=\"!hitEnd && source.isLoading\">Loading</span><span ng-if=\"hitEnd\">{{ noMoreResolvedLabel }}</span>\n" +
                "  </a>\n" +
                "</div>",
                link: function(scope, element, attrs) {

                    if (angular.isUndefined(scope.source)
                        || !angular.isFunction(scope.source.get)) {
                        throw new Error("Datapager: data source is not valid");
                    }

                    scope.loadMoreResolvedLabel = scope.loadMoreLabel || "More";
                    scope.noMoreResolvedLabel = scope.noMoreLabel || "No more results";

                    scope.limit = scope.itemsPerPage;
                    if (angular.isUndefined(scope.limit) || scope.limit < 1)
                        scope.limit = 10; // default page size

                    scope.page = 0;
                    scope.hitEnd = false;
                    scope.target = [];

                    scope.source.isEmpty = false;
                    scope.source.isLoading = false;

                    /** Show next page. */
                    scope.appendPage = function() {
                        scope.page++;
                        scope.update();
                    };

                    /** Full update of current directive on datasource changing. */
                    scope.$watch('source', function(current, previous) {
                        if (angular.isUndefined(current.revision) || current.revision == previous.revision)
                            return; // do not refresh
                        scope.target = [];
                        scope.page = 0;
                        scope.hitEnd = false;
                        scope.update()
                    }, true);

                    /** Update current state and view. */
                    scope.update = function() {
                        scope.source.isLoading = true;
                        scope.source.isEmpty = false;

                        var originalRevision = scope.source.revision;

                        scope.source.get(scope.page * scope.limit, scope.limit, function(data) {
                            if (scope.source.revision !== originalRevision) {
                                return; // newer datasource is already in place
                            }
                            // if (data.length < scope.limit) CONSTRUCT query fix
                            if (data.length == 0)
                                scope.hitEnd = true;
                            if (data.length == 0 && scope.page == 0)
                                scope.source.isEmpty = true;
                            scope.target.push.apply(scope.target, data);
                            scope.source.isLoading = false;
                        });
                    };

                    scope.update(); // initial load

                }
            }
        })

    /**
     * Async data loader directive with pagination support
     */
        .directive('datapager', ['lodash', function(_) {

            function generatePagesArray(currentPage, totalPages, paginationRange) {
                var pages = [];
                var halfWay = Math.ceil(paginationRange / 2);
                var position;

                if (currentPage <= halfWay) {
                    position = 'start';
                } else if (totalPages - halfWay < currentPage) {
                    position = 'end';
                } else {
                    position = 'middle';
                }

                var ellipsesNeeded = paginationRange < totalPages;
                var i = 1;
                while (i <= totalPages && i <= paginationRange) {
                    var pageNumber = calculatePageNumber(i, currentPage, paginationRange, totalPages);

                    var openingEllipsesNeeded = (i === 2 && (position === 'middle' || position === 'end'));
                    var closingEllipsesNeeded = (i === paginationRange - 1 && (position === 'middle' || position === 'start'));
                    if (ellipsesNeeded && (openingEllipsesNeeded || closingEllipsesNeeded)) {
                        pages.push('...');
                    } else {
                        pages.push(pageNumber);
                    }
                    i ++;
                }
                return pages;
            }

            function calculatePageNumber(i, currentPage, paginationRange, totalPages) {
                var halfWay = Math.ceil(paginationRange / 2);
                if (i === paginationRange) {
                    return totalPages;
                } else if (i === 1) {
                    return i;
                } else if (paginationRange < totalPages) {
                    if (totalPages - halfWay < currentPage) {
                        return totalPages - paginationRange + i;
                    } else if (halfWay < currentPage) {
                        return currentPage - halfWay + i;
                    } else {
                        return i;
                    }
                } else {
                    return i;
                }
            }

            return {
                restrict: 'A',
                replace: true,
                scope: {
                    source: '=',
                    target: '=',
                    totalCount: '@',
                    itemsPerPage: '@'
                },
                template:
                "<div>"
                + "<ul class=\"pagination pagination-sm\" ng-if=\"1 < pages.length\">"
                + "    <li ng-classs=\"{ disabled : pagination.current == pagination.first }\">"
                + "        <a href ng-click=\"setPage(pagination.first)\">&laquo;</a>"
                + "    </li>"
                + "    <li ng-class=\"{ disabled : pagination.current == pagination.first }\">"
                + "        <a href ng-click=\"setPage(pagination.current - 1)\">&lsaquo;</a>"
                + "    </li>"
                + "    <li ng-repeat=\"pageNumber in pages track by $index\" ng-class=\"{ active : pagination.current == pageNumber, disabled : pageNumber == '...' }\">"
                + "        <a href ng-click=\"setPage(pageNumber)\">{{ pageNumber }}</a>"
                + "    </li>"
                + "    <li ng-class=\"{ disabled : pagination.current == pagination.last }\">"
                + "        <a href ng-click=\"setPage(pagination.current + 1)\">&rsaquo;</a>"
                + "    </li>"
                + "    <li ng-class=\"{ disabled : pagination.current == pagination.last }\">"
                + "        <a href ng-click=\"setPage(pagination.last)\">&raquo;</a>"
                + "    </li>"
                + "</ul>"
                + "</div>",
                link: function(scope, element, attrs) {

                    if (!angular.isDefined(scope.totalCount)) {
                        throw new Error("Datapager: total items count not specified")
                    }

                    if (angular.isUndefined(scope.source)
                        || !angular.isFunction(scope.source.get)) {
                        throw new Error("Datapager: data source is not valid");
                    }

                    var limit = scope.itemsPerPage;
                    if (angular.isUndefined(limit) || limit < 1)
                        limit = 10; // default page size
                    var totalCount = Number(scope.totalCount);
                    var pagesCount = Math.ceil(totalCount / limit);


                        scope.pagination = {
                        current: 1,
                        first: 1,
                        last: pagesCount
                    };

                    scope.pages = [];

                    scope.target = [];

                    scope.source.isEmpty = false;
                    scope.source.isLoading = false;

                    /** Update current state and view. */
                    scope.setPage = function(pageNumber) {
                        if (pageNumber < scope.pagination.first
                            || pageNumber > scope.pagination.last) {
                            return; // prevent bad behavior
                        }

                        scope.source.isLoading = true;
                        scope.source.isEmpty = false;
                        scope.pagination.current = pageNumber;
                        scope.pages = generatePagesArray(pageNumber, pagesCount, 7);

                        scope.source.get((pageNumber - 1) * limit, limit)
                            .then(function(data) {
                                scope.target = []; // delete previous content
                                scope.target.push.apply(scope.target, data);
                            })
                            .catch(function() {
                                scope.target.push.apply(scope.target, []);
                                scope.source.isEmpty = true;
                            })
                            .finally(function() {
                                scope.source.isLoading = false;
                            });
                    };

                    scope.setPage(1); // initial load

                }
            }
        }]);



})();