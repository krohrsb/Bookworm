/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/24/13 8:56 AM
 */
/*global angular*/
(function (angular) {
    'use strict';
    var module = angular.module('bookworm.search.routes', [], function () {});

    module.config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state('search', {
                url: '/search',
                templateUrl: 'partials/search/index',
                controller: 'SearchCtrl',
                resolve: {
                    results: function () {
                        return [];
                    }
                }
            }).
            state('searchAuthor', {
                url: '/search/authors/{query}',
                templateUrl: 'partials/search/authors',
                controller: 'SearchCtrl',
                resolve: {
                    results: function (Restangular, $stateParams) {
                        return Restangular.all('library').all('authors').getList({q: $stateParams.query});
                    }
                }
            }).
            state('searchBook', {
                url: '/search/books/{query}',
                templateUrl: 'partials/search/books',
                controller: 'SearchCtrl',
                resolve: {
                    results: function (Restangular, $stateParams) {
                        return Restangular.all('library').all('books').getList({q: $stateParams.query});
                    }
                }
            });
    }]);
}(angular));