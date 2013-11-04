/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/24/13 8:56 AM
 */
/*global angular*/
(function (angular) {
    "use strict";
    var module = angular.module('bookworm.search.controllers', [], function () {});

    module.controller('SearchCtrl', ['$scope', '$state', 'results', function ($scope, $state, results) {
        $scope.search = function (view, query) {
            $state.go(view, {query: query});
        };
        $scope.results = results;
    }]);
}(angular));