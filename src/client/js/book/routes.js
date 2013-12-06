/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/24/13 8:56 AM
 */
/*global angular*/
(function (angular) {
    'use strict';
    var module = angular.module('bookworm.book.routes', [], function () {});

    module.config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state('book', {
                url: '/books/{id}',
                templateUrl: 'partials/books/book',
                controller: 'BookCtrl',
                resolve: {
                    book: ['Restangular', '$stateParams', function (Restangular, $stateParams) {
                        return Restangular.one('books', $stateParams.id).get({expand: 'releases'});
                    }]
                }
            })
            .state('books', {
                url: '/books?status&sort',
                templateUrl: 'partials/books/books',
                controller: 'BooksCtrl',
                resolve: {
                    books: ['Restangular', '$stateParams', function (Restangular, $stateParams) {
                        return Restangular.all('books').getList($stateParams);
                    }]
                }
            });
    }]);
}(angular));