/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/24/13 8:56 AM
 */
/*global angular, bookworm*/
(function (angular, bookworm) {
    "use strict";
    var module = angular.module('bookworm.setting.controllers', [], function () {});

    module.controller('SettingsCtrl', ['$scope', '$filter', 'Restangular', 'toaster', 'guid', function ($scope, $filter, Restangular, toaster, guid) {

        /**
         * Application environment info
         * @type {object}
         */
        $scope.environment = null;

        /**
         * Settings object that contains all settings.
         * @type {object}
         */
        $scope.settings = null;

        /**
         * Log levels
         * @type {Array}
         */
        $scope.logLevels = ['debug', 'info', 'warn', 'error'];

        /**
         * Add host helper method. Simply creates a new blank object at the beginning of the array.
         * @param arr
         */
        $scope.addHost = function (arr) {
            arr.unshift({});
        };

        /**
         * Removes a host at the specified index.
         * @param {Array} arr - the array of hosts
         * @param {number} index - the index we are removing at
         * @param {string} mask - json mask string to use when persisting
         */
        $scope.removeHost = function (arr, index, mask) {
            //remove it
            arr.splice(index, 1);
            //persist using provided mask.
            Restangular.all('settings').customPUT($filter('mask')($scope.settings, mask)).then(function () {
                toaster.pop('success', 'Removed', 'Successfully removed host.');
            });
        };

        /**
         * Generate an API key.
         * Emit populate event to the settings directive.
         */
        $scope.generateApiKey = function () {
            $scope.$emit('setting:populate', 'settings.server.apiKey');
            $scope.settings.server.apiKey = guid.generate();
        };

        // grab the initial settings data;
        Restangular.one('settings').get().then(function (settings) {
            $scope.settings = settings.data;
        });

        Restangular.one('environment').get().then(function (environment) {
            $scope.environment = environment;
            $scope.environment.package.dependenciesList = Object.keys($scope.environment.package.dependencies).join(', ');
            $scope.environment.package.devDependenciesList = Object.keys($scope.environment.package.devDependencies).join(', ');
        });

    }]);

}(angular, bookworm));