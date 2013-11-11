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
                    book: function (Restangular, $stateParams) {
                        return Restangular.one('books', $stateParams.id).get();
                    },
                    releases: function (Restangular, $stateParams) {
                        return Restangular.one('books', $stateParams.id).all('releases').getList();
                    }
                }
            })
            .state('wanted', {
                url: '/wanted',
                templateUrl: 'partials/books/wanted',
                controller: 'WantedBooksCtrl',
                resolve: {
                    books: function (Restangular) {
                        return Restangular.all('books').getList({status: 'wanted', sort: 'published'});
                    }
                }
            });
    }]);
}(angular));