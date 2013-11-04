/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/24/13 8:56 AM
 */
/*global angular*/
(function (angular) {
    "use strict";
    var module = angular.module('bookworm.log.controllers', [], function () {});

    module.controller('LogsCtrl', ['$scope', 'Restangular', function ($scope, Restangular) {
        var logs, limit;
        limit = 20;
        logs = Restangular.all('logs');
        logs.getList({limit: limit}).then(function (data) {
            $scope.logs = data;
            $scope.totalItems = data.metadata.total;
        });
        $scope.currentPage = 1;


        $scope.$watch('currentPage', function (newVal, oldVal) {
            if (!angular.equals(oldVal, newVal)) {
                logs.getList({
                    offset: (newVal - 1) * $scope.logs.metadata.limit,
                    limit: $scope.logs.metadata.limit
                }).then(function (data) {
                    $scope.logs = data;
                    $scope.totalItems = data.metadata.total;
                });
            }
        });
    }]);

}(angular));