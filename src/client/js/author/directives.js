/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/24/13 11:35 AM
 */
/*global angular*/
(function (angular) {
    'use strict';
    var module;
    module = angular.module('bookworm.author.directives', [], function () {});
    module.directive('bwAuthor', ['$q', 'socket', 'Restangular', 'toaster', function ($q, socket, Restangular, toaster) {
        return {
            restrict: 'A',
            replace: true,
            transclude: true,
            templateUrl: 'partials/templates/author',
            scope: {
                author: '=',
                expanded: '='
            },
            link: function(scope) {

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
                    scope.author.get({refresh: true, 'new': true, expand: 'books,latestBook,booksCount'}).then(function (updatedAuthor) {
                        scope.author = updatedAuthor;
                        toaster.pop('success', 'Finished', 'Refreshed author\'s books.');
                    });
                };

                /**
                 * Refresh the author and all book data.
                 */
                scope.refreshAuthor = function () {
                    toaster.pop('info', 'Please Wait', 'Refreshing author and book information...');
                    scope.author.get({refresh: true, 'new': false, expand: 'books,latestBook,booksCount'}).then(function (updatedAuthor) {
                        scope.author = updatedAuthor;
                        toaster.pop('success', 'Finished', 'Refreshed author\'s information.');
                    });
                };
            }
        };
    }]);
}(angular));