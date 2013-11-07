/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/24/13 8:56 AM
 */
/*global angular*/
(function (angular) {
    "use strict";
    var module = angular.module('bookworm.author.controllers', [], function () {});

    module.controller('AuthorCtrl', ['$scope', 'socket', 'author', 'books', function ($scope, socket, author, books) {
        $scope.author = author;
        $scope.books = books;
        socket.forward('book:update', $scope);

        $scope.$on('socket:book:update', function (ev, updatedBook) {
            var i, len, book;
            for (i = 0, len = ev.targetScope.books.length; i < len; i = i + 1) {
                book = ev.targetScope.books[i];
                if (book.id.toString() === updatedBook.id.toString()) {
                    book.status = updatedBook.status;
                    book.updated = updatedBook.updated;
                    break;
                }
            }
        });


    }]);

    module.controller('AuthorsCtrl', ['$scope', 'authors', function ($scope, authors) {
        $scope.authors = authors;
    }]);
}(angular));