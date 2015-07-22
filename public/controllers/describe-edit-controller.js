(function() {

    angular.module('app.controllers')

        .controller('DescribeEditController', ['$scope', '$rootScope', '$state', '$stateParams', 'Config', 'lodash', 'Describe', 'View', 'State', 'PrefixesReplacer',
            function($scope, $rootScope, $state, $stateParams, Config, _, Describe, View, State, PrefixesReplacer) {

                init();

                $scope.action = 'loading';

                Describe.describeEdit($scope.resource)
                    .then(function(data) {
                        $scope.$graph = data;
                        initDecision();
                    });

                function initDecision() {

                    $scope.action = 'decision';

                    $scope.actionCreateNew = function() {
                        initEditor();
                        initNewModel();
                    }

                }

                function saveChanges() {
                    var errors = [];
                    var model = _.cloneDeep($scope.viewModel);

                    if (_.isEmpty(model.description)) {
                        errors.push("Description must not be empty");
                    }

                    var rules = _.filter(model.matchingRules, function(rule) {
                        return _.isPlainObject(rule);
                    });

                    if (rules.length < 1) {
                        errors.push("At least one matching rule must be defined");
                    } else {
                        var uniq = _.uniq(rules);
                        if (uniq.length != rules.length) {
                            errors.push("Matching rules must not contain duplicates");
                        }
                    }

                    if (errors.length > 0) {
                        _.forEach(errors, function(error) {
                            $scope.$emit('toast', {
                                type: 'error',
                                message: error
                            });
                        });
                        return;
                    }

                    rules = _.map(rules, function(ruleObject) {
                        return ruleObject.rule;
                    });

                    $scope.savingChanges = true;

                    var customView = View.contract($scope.$viewEdit);
                    customView.referenceUri = $scope.viewModel.referenceUri;
                    customView.description = $scope.viewModel.description;
                    customView.matchingRules = rules;

                    console.log(customView);
                    if (_.isEmpty($scope.$viewId)) {
                        // create
                        View.create(customView)
                            .then(function(data) {
                                console.log(data.view.id);
                                $scope.$viewId = data.view.id;
                            })
                            .finally(function() {
                                $scope.savingChanges = false;
                            })
                    } else {
                        // update
                        customView.id = $scope.$viewId;
                        View.update(customView)
                            .finally(function() {
                                $scope.savingChanges = false;
                            })
                    }
                }

                function initEditor() {
                    $scope.action = 'editor';
                    $scope.savingChanges = false;
                    initTabs();
                    $scope.options = {
                        layouts: Config.getLayouts(),
                        matchingRules: getMatchingRules()
                    };
                    $scope.addMatchingRule = function() {
                        $scope.viewModel.matchingRules.push(undefined);
                    };

                    $scope.updateLayout = function(layout) {
                        console.log(layout);
                        var extractedMiniapps = View.extractMiniapps($scope.$viewEdit);
                        var generatedView = View.generate(layout, extractedMiniapps);
                        console.log(generatedView);
                        $scope.$viewEdit = generatedView;
                    };

                    $scope.actionDiscardChanges = function() {
                        $state.go('root.describe.formatted', { resource: $scope.resource }, { inherit: true });
                    };

                    $scope.actionSaveChanges = function() {
                        saveChanges();
                        console.log('saving');
                    };
                }

                function initNewModel() {
                    $scope.$viewEdit = View.expand($scope.$graph.viewDefault);
                    $scope.$viewId = null;
                    $scope.viewModel = {
                        referenceUri: $scope.resource,
                        description: "",
                        matchingRules: [undefined],
                        layout: $scope.$viewEdit.layout
                    };
                }


                function init() {
                    var requestedResource = $stateParams.resource;
                    if (!requestedResource || _.isEmpty(requestedResource)) {
                        $state.go('404');
                        return;
                    }

                    var expanded = PrefixesReplacer.expand(requestedResource);
                    if (!_.isEqual(requestedResource, expanded)) {
                        $state.go($state.$current, {resource: expanded});
                        return;
                    }

                    State.setEndpoint($stateParams.endpoint, 'describe-endpoint-changed');
                    $scope.endpoint = State.getEndpoint();

                    State.setLanguage($stateParams.language, 'describe-language-changed');
                    $scope.language = State.getLanguage();

                    $scope.resource = $stateParams.resource;
                }

                function initTabs() {
                    $scope.displaySettings = true;
                    $scope.displayLayout = false;
                    $scope.displayToggle = function() {
                        $scope.displaySettings = !$scope.displaySettings;
                        $scope.displayLayout = !$scope.displayLayout;
                    };
                }

                function getMatchingRules() {
                    var rules = [];

                    rules.push({
                        group: 'Entity',
                        label: '@id equals ' + PrefixesReplacer.contract($scope.resource),
                        labelHtml: '@id <i>equals</i> ' + PrefixesReplacer.contract($scope.resource),
                        rule: { property: '@id', equals: $scope.resource }
                    });

                    _.forEach($scope.$graph['@type'], function(type) {
                        rules.push({
                            group: 'Entity',
                            label: '@type includes ' + PrefixesReplacer.contract(type['@id']),
                            labelHtml: '@type <i>includes</i> ' + PrefixesReplacer.contract(type['@id']),
                            rule: { property: '@type', includes: type['@id'] }
                        });
                    });

                    _.forEach($scope.$graph.property, function(property) {
                        var label = PrefixesReplacer.contract(property['@id']);
                        if (property.relation == 'object') {
                            label = "is " + label + " of";
                        }
                        rules.push({
                            group: property.relation == 'subject' ? 'Subject of relations' : 'Object of relations',
                            label: label + ' exists',
                            labelHtml: label + ' <i>exists</i>',
                            rule: { property: property['@id'], relation: property.relation, mode: 'exists' }
                        });
                        var availableTypes = [];
                        _.forEach(property.data, function(object) {
                            if (_.has(object, '@id')) {
                                _.forEach(object['@type'], function (type) {
                                    availableTypes.push(type['@id']);
                                })
                            }
                        });
                        availableTypes = _.uniq(availableTypes);
                        _.forEach(availableTypes, function(type) {
                            rules.push({
                                group: property.relation == 'subject' ? 'Subject of relations' : 'Object of relations',
                                label: label + ' @type includes ' + PrefixesReplacer.contract(type),
                                labelHtml: label + ' @type <i>includes</i> ' + PrefixesReplacer.contract(type),
                                rule: { property: property['@id'], relation: property.relation, mode: 'type', includes: type }
                            });
                        });
                    });

                    return rules;

                }

            }
        ]);

})();