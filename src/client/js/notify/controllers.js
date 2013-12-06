/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/24/13 8:56 AM
 */
/*global angular*/
(function (angular) {
    "use strict";
    var module = angular.module('bookworm.notify.controllers', [], function () {});

    module.controller('NotificationCtrl', ['$scope', '$filter', 'Restangular', function ($scope, $filter, Restangular) {
        /**
         * Notify My Android Priorities
         * @type {Array}
         */
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

        /**
         * NMA Verify/Notify result string
         * @type {string}
         */
        $scope.nmaResult = 'n/a';
        /**
         * NMA Message to test with
         * @type {string}
         */
        $scope.nmaMessage = '';

        /**
         * Verify NMA works by testing the API
         */
        $scope.nmaVerify = function () {
            $scope.nmaResult = 'please wait...';
            Restangular.one('notifiers', 'nma').one('verify', '').get().then(function (data) {
                $scope.nmaResult = data.message;
            }, function (err) {
                $scope.nmaResult = err.data.message;
            });
        };

        /**
         * Test NMA by sending a notification
         * @param {string} message - Message to send
         */
        $scope.nmaNotify = function (message) {
            $scope.nmaResult = 'please wait...';
            Restangular.one('notifiers', 'nma').all('notify').customPUT({description: message}).then(function (data) {
                $scope.nmaResult = data.message;
            }, function (err) {
                $scope.nmaResult = err.data.message;
            });
        };

    }]);

}(angular));