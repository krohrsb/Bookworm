/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/24/13 11:35 AM
 */
/*global angular*/
(function (angular) {
    'use strict';
    var module;
    module = angular.module('bookworm.search.directives', [], function () {});
    module.directive('bwSearchBook', ['Restangular', function (Restangular) {
        return {
            restrict: 'A',
            replace: true,
            transclude: true,
            templateUrl: 'partials/templates/search-book',
            scope: {
                book: '='
            },
            link: function(scope, element, attrs) {
                var books;

                books = Restangular.all('books');

                scope.addBook = function (book) {
                    books.post(book).then(function (book) {
                        console.log('added book: ' + book.id);
                    });
                };
            }
        };
    }]);
    module.directive('bwSearchAuthor', ['Restangular', function (Restangular) {
        return {
            restrict: 'A',
            replace: true,
            transclude: true,
            templateUrl: 'partials/templates/search-author',
            scope: {
                author: '='
            },
            link: function(scope, element, attrs) {

                var authors;

                authors = Restangular.all('authors');

                scope.addAuthor = function (author) {
                    authors.post(author).then(function (author) {
                        console.log('added author: ' + author.id);
                    });
                };
            }
        };
    }]);
}(angular));