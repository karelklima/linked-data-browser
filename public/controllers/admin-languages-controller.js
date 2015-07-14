(function() {

    angular.module('app.controllers')

        .controller('AdminLanguagesController', ['$scope', '$http', 'Language', 'lodash', 'Config',
            function($scope, $http, Language, _, Config) {

                $scope.languageForm = {};
                $scope.languages = null;
                $scope.displayedLanguages = null;

                Language.getAll().then(function (languages) {
                    $scope.languages = languages;
                    $scope.displayedLanguages = languages;
                });

                $scope.create = function() {
                    Language.create({
                        label: $scope.languageForm.label,
                        alias: $scope.languageForm.alias
                    })
                        .then(function(data) {
                            $scope.languages.push(data.language);
                            $scope.languageForm = {}; // clear form model
                            Config.reload(); // update environment
                        })


                };

                $scope.makeDefault = function(language) {

                    Language.update({
                        id: language.id,
                        default: true
                    })
                        .then(function() {
                            _.forEach($scope.languages, function(ep) {
                                ep.default = false;
                            });
                            language.default = true;
                            Config.reload(); // update environment
                        });

                };

                $scope.remove = function(language) {
                    Language.remove({
                        id: language.id
                    })
                        .then(function() {
                            _.remove($scope.languages, {id: language.id});
                            Config.reload(); // update environment
                        });
                }

            }
        ]);

})();