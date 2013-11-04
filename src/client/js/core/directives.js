/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/24/13 11:35 AM
 */
/*global angular*/
(function (angular) {
    'use strict';
    var module;
    module = angular.module('bookworm.core.directives', [], function () {});
    module.directive('bwStatus', function () {
        return {
            restrict: 'A',
            scope: {
                status: '=bwStatus'
            },
            link: function(scope, element, attrs) {

                var statusMap = {
                    downloaded: 'success',
                    wanted: 'danger',
                    snatched: 'info',
                    skipped: 'default',
                    excluded: 'warning'
                };

                element.addClass(attrs.prefix + '-' + statusMap[scope.status]);
            }
        };
    });
}(angular));