/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/24/13 8:56 AM
 */
/*global angular*/
(function (angular) {
    "use strict";
    var module = angular.module('bookworm.manage.controllers', [], function () {});

    module.controller('ManageCtrl', ['$scope', '$filter', 'Restangular', 'toaster', function ($scope, $filter, Restangular, toaster) {
        /**
         * Perform an action
         * @param {string} actionName - name of the action to perform
         */
        $scope.action = function (actionName) {
            Restangular.all('actions').customPOST({action: actionName}, 'general').then(function () {
                toaster.pop('success', 'Successful', 'Successfully initiated action: '+ $filter('inflector')(actionName, 'humanize'));
            });
        };

    }]);

}(angular));