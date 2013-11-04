/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/24/13 8:56 AM
 */
/*global angular*/
(function (angular) {
    "use strict";
    var module = angular.module('bookworm.book.controllers', [], function () {});

    module.controller('BookCtrl', ['$scope', 'book', function ($scope, book) {
        $scope.book = book;
    }]);

    module.controller('BooksCtrl', ['$scope', 'books', function ($scope, books) {
        $scope.books = books;
    }]);
}(angular));