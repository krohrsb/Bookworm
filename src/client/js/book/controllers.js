/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/24/13 8:56 AM
 */
/*global angular*/
(function (angular) {
    "use strict";
    var module = angular.module('bookworm.book.controllers', [], function () {});

    module.controller('BookCtrl', ['$scope', 'book', 'releases', 'socket', function ($scope, book, releases, socket) {
        socket.forward('book:update', $scope);
        socket.forward('release:update', $scope);
        socket.forward('release:create', $scope);
        $scope.book = book;
        $scope.releases = releases;


        $scope.$on('socket:book:update', function (ev, updatedBook) {
            if (ev.targetScope.book.id.toString() === updatedBook.id.toString()) {
                ev.targetScope.book.status = updatedBook.status;
                ev.targetScope.book.updated = updatedBook.updated;
            }
        });

        $scope.$on('socket:release:update', function (ev, updatedRelease) {
            var i, len, release;
            if (ev.targetScope.book.id.toString() === updatedRelease.bookId.toString()) {
                for (i = 0, len = ev.targetScope.releases.length; i < len; i = i + 1) {
                    release = ev.targetScope.releases[i];
                    if (release.id.toString() === updatedRelease.id.toString()) {
                        release.status = updatedRelease.status;
                        release.updated = updatedRelease.updated;
                        release.directory = updatedRelease.directory;
                        break;
                    }
                }
            }
        });

        $scope.$on('socket:release:create', function (ev, createdRelease) {
            if (ev.targetScope.book.id === createdRelease.bookId) {
                ev.targetScope.releases.unshift(createdRelease);
            }
        });

    }]);


    module.controller('WantedBooksCtrl', ['$scope', 'books', function ($scope, books) {
        $scope.books = books;

    }]);

    module.controller('BookListCtrl', ['$scope', function ($scope) {
        $scope.limit = 5;
        $scope.currentPage = 1;
        $scope.maxSize = 5;
        $scope.totalItems = 0;

        $scope.$watch('books', function (newVal) {
            $scope.totalItems = newVal.length;
        });
    }]);


}(angular));