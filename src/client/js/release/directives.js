/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/24/13 11:35 AM
 */
/*global angular*/
(function (angular) {
    'use strict';
    var module;
    module = angular.module('bookworm.release.directives', [], function () {});
    module.directive('bwRelease', ['socket', function (socket) {
        return {
            restrict: 'A',
            replace: true,
            transclude: true,
            templateUrl: 'partials/templates/release',
            scope: {
                release: '='
            },
            link: function(scope) {

                socket.forward('release:update', scope);

                //set collapsed state, default true
                scope.collapsed = true;

                /**
                 * on release update, update local instance
                 */
                scope.$on('socket:release:update', function (ev, updatedRelease) {
                    if (ev.targetScope.release.id.toString() === updatedRelease.id.toString()) {
                        scope.release.status = updatedRelease.status;
                        scope.release.updatedAt = updatedRelease.updatedAt;
                        scope.release.directory = updatedRelease.directory;
                    }
                });
                /**
                 * Update the status of a release
                 * @param {string} status - The status
                 */
                scope.updateStatus = function (status) {
                    scope.release.status = status;
                    scope.release.put().then(function (updatedRelease) {
                        scope.release = updatedRelease;
                    });
                };

            }
        };
    }]);
}(angular));