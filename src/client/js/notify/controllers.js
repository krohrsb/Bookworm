/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/24/13 8:56 AM
 */
/*global angular*/
(function (angular) {
    "use strict";
    var module = angular.module('bookworm.notify.controllers', [], function () {});

    module.controller('NotificationCtrl', ['$scope', '$filter', 'Restangular', 'toaster', function ($scope, $filter, Restangular, toaster) {
        $scope.nmaPriorities = [{
            name: 'Very Low',
            value: -2
        }, {
            name: 'Moderate',
            value: -1
        }, {
            name: 'Normal',
            value: 0
        }, {
            name: 'High',
            value: 1
        }, {
            name: 'Emergency',
            value: 2
        }];

        $scope.nmaResult = 'n/a';
        $scope.nmaMessage = '';

        $scope.nmaVerify = function () {
            Restangular.one('notifiers', 'nma').one('verify', '').get().then(function (data) {
                $scope.nmaResult = data.message;
            }, function (err) {
                $scope.nmaResult = err.data.message;
                toaster.pop('error', 'Error', err.data.message);
            });
        };

        $scope.nmaNotify = function (message) {
            Restangular.one('notifiers', 'nma').all('notify').customPUT({description: message}).then(function (data) {
                $scope.nmaResult = data.message;
            }, function (err) {
                $scope.nmaResult = err.data.message;
                toaster.pop('error', 'Error', err.data.message);
            });
        };

    }]);

}(angular));