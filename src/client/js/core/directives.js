/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/24/13 11:35 AM
 */
/*global angular*/
(function (angular) {
    'use strict';
    var module;
    module = angular.module('bookworm.core.directives', [], function () {});

    module.directive('navbarMainCollapse', ['$rootScope', function ($rootScope) {
        return {
            restrict: 'C',
            link: function (scope, element) {
                $rootScope.$on('$stateChangeSuccess', function () {
                    if (!element.hasClass('collapse')) {
                        element.collapse('hide');
                    }

                });
            }
        };
    }]);

    module.directive('bwListToolbar', function () {
        return {
            restrict: 'A',
            replace: true,
            transclude: true,
            templateUrl: 'partials/templates/list-toolbar',
            scope: {
                ignoreStatus: '=',
                statuses: '=',
                onToggleSelectAll: '&',
                showIgnoreStatus: '=',
                onSetSelected: '&',
                selecting: '=',
                onOpenFilter: '&',
                filtering: '='
            },
            link: function(scope) {
                /**
                 * Denotes if all are selected or not
                 * @type {boolean}
                 */
                scope.allSelected = false;
                /**
                 * Current selecting status (from dropdown)
                 * @type {string}}
                 */
                scope.selectingStatus = scope.statuses[0];

                /**
                 * Toggles selecting state.
                 */
                scope.toggleSelecting = function () {
                    scope.selecting = !scope.selecting;

                    if (!scope.selecting) {
                        scope.toggleSelectAll(false);
                    }
                };

                /**
                 * Toggles select all
                 * @param {boolean} [select] - the forced toggle if desired
                 */
                scope.toggleSelectAll = function (select) {

                    if (typeof select !== 'undefined') {
                        scope.allSelected = select;
                    } else {
                        scope.allSelected = !scope.allSelected;
                    }
                    scope.onToggleSelectAll({allSelected: scope.allSelected});
                };

                /**
                 * Toggle ignore status boolean.
                 */
                scope.toggleIgnoreStatus = function () {
                    scope.showIgnoreStatus = !scope.showIgnoreStatus;
                };

                /**
                 * Set selected with status
                 * @param {string} status - the status to set
                 */
                scope.setSelected = function (status) {
                    scope.onSetSelected({status: status});
                };

                /**
                 * Open the filter
                 */
                scope.openFilter = function () {
                    scope.onOpenFilter();
                };
            }
        };
    });
}(angular));