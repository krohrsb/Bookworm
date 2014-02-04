/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/24/13 11:35 AM
 */
/*global angular*/
(function (angular) {
    'use strict';
    var module;
    module = angular.module('bookworm.author.directives', [], function () {});
    module.directive('bwAuthor', ['$q', 'socket', 'Restangular', 'toaster', '$timeout', '$modal', function ($q, socket, Restangular, toaster, $timeout, $modal) {
        return {
            restrict: 'A',
            replace: true,
            transclude: true,
            templateUrl: 'partials/templates/author',
            scope: {
                author: '=',
                expanded: '=',
                selecting: '='
            },
            link: function(scope) {
                //forward event for socket.io
                socket.forward('author:update', scope);

                /**
                 * On author update, check to see if we are the author and if so update our details.
                 */
                scope.$on('socket:author:update', function (ev, updatedAuthor) {
                    if (ev.targetScope.author.id.toString() === updatedAuthor.id.toString()) {
                        ev.targetScope.author.status = updatedAuthor.status;
                        ev.targetScope.author.updated = updatedAuthor.updated;
                    }
                });

                //if this author's selected state is not set, set it to false
                if (typeof scope.author.selected === 'undefined') {
                    scope.author.selected = false;
                }
                /**
                 * Update the status of an author
                 * @param {string} status - The status to update to
                 */
                scope.updateStatus = function (status) {
                    var books;
                    //set the status on the author
                    scope.author.status = status;
                    //store local reference to the books as we aren't touching/updating them any.
                    books = scope.author.books;

                    //update the author, request an updated one with latestBook and booksCount filled out
                    scope.author.put({expand: 'latestBook,booksCount'}).then(function (updatedAuthor) {
                        //set author
                        scope.author = updatedAuthor;
                        //set books to stored variable
                        scope.author.books = books;
                    });
                };

                /**
                 * Check the author for new books
                 */
                scope.checkNewBooks = function () {
                    toaster.pop('info', 'Please Wait', 'Checking for new books...');
                    //get a new refreshed author, only caring about 'new' books.
                    scope.author.get({refresh: true, newBooks: true, expand: 'books,latestBook,booksCount'}).then(function (updatedAuthor) {
                        scope.author = updatedAuthor;
                        $timeout(function () {
                            toaster.pop('success', 'Finished', 'Refreshed author\'s books.');
                        }, 0);
                    });
                };

                /**
                 * Refresh the author and all book data.
                 */
                scope.refreshAuthor = function () {
                    toaster.pop('info', 'Please Wait', 'Refreshing author and book information...');
                    scope.author.get({refresh: true, newBooks: false, expand: 'books,latestBook,booksCount'}).then(function (updatedAuthor) {
                        scope.author = updatedAuthor;
                        $timeout(function () {
                            toaster.pop('success', 'Finished', 'Refreshed author\'s information.');
                        }, 0);

                    });
                };

                scope.deleteAuthor = function () {
                    var modalInstance = $modal.open({
                        templateUrl: 'partials/templates/confirm-modal',
                        controller: 'ModalConfirmInstanceCtrl',
                        resolve: {
                            options: function () {
                                return {
                                    message: 'Are you sure you wish to delete the author ' + scope.author.name + '?'
                                };
                            }
                        }

                    });

                    modalInstance.result.then(function () {
                        scope.author.remove().then(function () {
                            console.log('deleted', arguments);
                        });
                    }, function () {
                        console.log('cancel');
                    });
                };
            }
        };
    }]);
}(angular));