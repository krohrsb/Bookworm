/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/24/13 8:56 AM
 */
/*global angular*/
(function (angular) {
    "use strict";
    var module = angular.module('bookworm.manage.controllers', [], function () {});

    module.controller('ManageCtrl', ['$scope', '$filter', 'Restangular', 'toaster', function ($scope, $filter, Restangular, toaster) {
        $scope.action = function (actionName) {
            Restangular.all('actions').customPOST({action: actionName}, 'general').then(function () {
                toaster.pop('success', 'Successful', 'Successfully initiated action: '+ actionName);
            }, function (err) {
                toaster.pop('error', 'Error', err.data.message);
            });
        };

    }]);

}(angular));