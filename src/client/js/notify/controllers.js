/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/24/13 8:56 AM
 */
/*global angular*/
(function (angular) {
    "use strict";
    var module = angular.module('bookworm.notify.controllers', [], function () {});

    module.controller('NotificationCtrl', ['$scope', '$filter', 'Restangular', 'toaster', function ($scope, $filter, Restangular, toaster) {
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

        $scope.pushoverPriorities = [{
            name: 'Quiet',
            value: -1
        }, {
            name: 'Normal',
            value: 0
        }, {
            name: 'High',
            value: 1
        }];

        /**
         * Test a notifier by sending a notification
         */
        $scope.notify = function (notifierName) {
            Restangular.one('notifiers', notifierName).all('notify').customPUT().then(function () {
                toaster.pop('success', 'Notified', 'Successfully sent notification');
            }, function (err) {
                toaster.pop('error', 'Error', err.message);
            });
        };

    }]);

}(angular));