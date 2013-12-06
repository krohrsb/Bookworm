/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/24/13 8:56 AM
 */
/*global angular*/
(function (angular) {
    "use strict";
    var module = angular.module('bookworm.core.controllers', [], function () {});

    module.controller('NavCtrl', ['$scope', function ($scope) {

    }]);


    module.controller('FilterModalInstanceCtrl', ['$scope', '$modalInstance', 'filterObject', 'customFilterObject', 'statuses', function ($scope, $modalInstance, filterObject, customFilterObject, statuses) {
        /**
         * Filter object passed around to fill/filter.
         * @type {object}
         */
        $scope.filterObject = filterObject;

        /**
         * Custom filter object, not used for general filter:object filtering.
         * @type {*}
         */
        $scope.customFilterObject = customFilterObject;

        /**
         * Statuses list.
         * @type {Array}
         */
        $scope.statuses = statuses;
        /**
         * Clear the filter by setting values to empty strings.
         */
        $scope.clear = function () {
            // loop through object resetting vlaues.
            angular.forEach($scope.filterObject, function (value, key) {
                $scope.filterObject[key] = '';
            });

            angular.forEach($scope.customFilterObject, function (value, key) {
                $scope.customFilterObject[key] = '';
            });
            // close modal
            $modalInstance.close();
        };
        /**
         * Close modal
         */
        $scope.close = function () {
            $modalInstance.dismiss('close');
        };
    }]);

}(angular));