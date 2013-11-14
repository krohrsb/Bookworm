/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/24/13 11:35 AM
 */
/*global angular*/
(function (angular) {
    'use strict';
    var module;
    module = angular.module('bookworm.book.directives', [], function () {});
    module.directive('bwBook', ['socket', 'Restangular', function (socket, Restangular) {
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

                //forward book:update event
                socket.forward('book:update', scope);
                //forward releases:create event
                socket.forward('release:create', scope);

                /**
                 * On book update, check to see if we are the book and if so update our status and updated properties.
                 */
                scope.$on('socket:book:update', function (ev, updatedBook) {
                    if (ev.targetScope.book.id.toString() === updatedBook.id.toString()) {
                        ev.targetScope.book.status = updatedBook.status;
                        ev.targetScope.book.updated = updatedBook.updated;
                    }
                });

                /**
                 * On Release creation, add it to the book's collection
                 */
                scope.$on('socket:release:create', function (ev, createdRelease) {
                    if (ev.targetScope.book.id === createdRelease.bookId) {
                        ev.targetScope.releases.unshift(createdRelease);
                    }
                });

                //if this book's selected state is not set, set it to false
                if (typeof scope.book.selected === 'undefined') {
                    scope.book.selected = false;
                }

                // button visibility flags
                scope.buttonVisibility = {
                    showRetryNew: false,
                    showSkip: false,
                    showWant: false,
                    showExclude: false
                };
                /**
                 * Update button visibility flags based on status
                 * @param status
                 */
                updateVisibilityChecks = function (status) {
                    scope.buttonVisibility.showRetryNew = status === "downloaded" || status === "snatched";
                    scope.buttonVisibility.showSkip = status.indexOf("wanted") === 0 || status === "snatched" || status === "downloaded" || status === "excluded";
                    scope.buttonVisibility.showWant = status === "skipped" || status === "excluded";
                    scope.buttonVisibility.showExclude = status !== "excluded";
                };
                //update flags initially
                updateVisibilityChecks(scope.book.status);

                //watch for status change for visibility updates
                scope.$watch('book.status', updateVisibilityChecks);

                /**
                 * Update a book's status
                 * @param {string} status - The status to update to
                 */
                scope.updateStatus = function (status) {
                    var releases;
                    scope.book.status = status;
                    releases = scope.book.releases;
                    scope.book.put().then(function (updatedBook) {
                        scope.book = updatedBook;
                        scope.book.releases = releases;
                    });
                };
            }
        };
    }]);
}(angular));