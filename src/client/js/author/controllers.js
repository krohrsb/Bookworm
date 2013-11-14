/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/24/13 8:56 AM
 */
/*global angular*/
(function (angular) {
    "use strict";
    var module = angular.module('bookworm.author.controllers', [], function () {});

    module.controller('AuthorCtrl', ['$scope', 'socket', 'author', 'toaster', function ($scope, socket, author, toaster) {
        $scope.author = author;

        // separate author.books so we can use book list separately
        $scope.$watch('author.books', function (books) {
            if (books) {
                $scope.books = books;
            }
        });

    }]);

    module.controller('AuthorsCtrl', ['$scope', 'authors', function ($scope, authors) {
        $scope.authors = authors;
    }]);
}(angular));