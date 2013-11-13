/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/24/13 11:35 AM
 */
/*global angular*/
(function (angular) {
    'use strict';
    var module;
    module = angular.module('bookworm.book.directives', [], function () {});
    module.directive('bwBook', [function () {
        return {
            restrict: 'A',
            replace: true,
            transclude: true,
            templateUrl: 'partials/templates/book',
            scope: {
                book: '=',
                expanded: '=',
                selecting: '='
            },
            link: function(scope) {
                var updateVisibilityChecks;

                if (typeof scope.book.selected === 'undefined') {
                    scope.book.selected = false;
                }

                scope.buttonVisibility = {
                    showRetryNew: false,
                    showSkip: false,
                    showWant: false,
                    showExclude: false
                };
                updateVisibilityChecks = function (status) {
                    scope.buttonVisibility.showRetryNew = status === "downloaded" || status === "snatched";
                    scope.buttonVisibility.showSkip = status.indexOf("wanted") === 0 || status === "snatched" || status === "downloaded" || status === "excluded";
                    scope.buttonVisibility.showWant = status === "skipped" || status === "excluded";
                    scope.buttonVisibility.showExclude = status !== "excluded";
                };
                updateVisibilityChecks(scope.book.status);
                scope.$watch('book.status', updateVisibilityChecks);

                scope.updateStatus = function (status, book) {
                    book.status = status;
                    book.put();
                };
            }
        };
    }]);
}(angular));