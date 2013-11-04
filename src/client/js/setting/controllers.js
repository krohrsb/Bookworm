/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/24/13 8:56 AM
 */
/*global angular*/
(function (angular) {
    "use strict";
    var module = angular.module('bookworm.setting.controllers', [], function () {});

    module.controller('SettingsCtrl', ['$scope', '$filter', 'Restangular', 'toaster', function ($scope, $filter, Restangular, toaster) {
        $scope.settings = null;

        $scope.logLevels = ['debug', 'info', 'warn', 'error'];

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
        $scope.addHost = function (arr) {
            arr.splice(0, 0, {});
        };

        $scope.removeHost = function (arr, index, mask) {
            arr.splice(index, 1);
            Restangular.all('settings').customPUT($filter('mask')($scope.settings, mask)).then(function () {
                toaster.pop('success', 'Removed', 'Successfully removed host.');
            }, function (err) {
                toaster.pop('error', 'Error', err.data.message);
            });
        };

        Restangular.one('settings').get().then(function (settings) {
            $scope.settings = settings.data;
        });

    }]);

}(angular));