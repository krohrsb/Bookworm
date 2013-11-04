/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/24/13 11:35 AM
 */
/*global angular*/
(function (angular) {
    'use strict';
    var module;
    module = angular.module('bookworm.release.directives', [], function () {});
    module.directive('bwRelease', [function () {
        return {
            restrict: 'A',
            replace: true,
            transclude: true,
            templateUrl: 'partials/templates/release',
            scope: {
                release: '='
            },
            link: function(scope, element, attrs) {

                scope.collapsed = true;

                scope.updateStatus = function (status, release) {
                    release.status = status;
                    release.put().then(function (updatedRelease) {
                        scope.release = updatedRelease;
                    });
                };

            }
        };
    }]);
}(angular));