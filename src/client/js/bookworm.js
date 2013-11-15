/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/23/13 3:12 PM
 */
/*global angular, _*/
(function (angular, _) {
    'use strict';

    // Define Modules
    angular.module('ui', ['ui.bootstrap', 'ui.router', 'ui.route', 'ui.inflector', 'ui.event', 'ui.format'], function () {});

    angular.module('bookworm.manage', ['bookworm.manage.controllers'], function () {});

    angular.module('bookworm.notify', ['bookworm.notify.controllers'], function () {});

    angular.module('bookworm.setting', ['bookworm.setting.routes', 'bookworm.setting.directives', 'bookworm.setting.controllers'], function () {});

    angular.module('bookworm.log', ['bookworm.log.routes', 'bookworm.log.controllers'], function () {});

    angular.module('bookworm.search', ['bookworm.search.routes', 'bookworm.search.directives', 'bookworm.search.controllers'], function () {});

    angular.module('bookworm.core', ['bookworm.core.services', 'bookworm.core.routes', 'bookworm.core.directives', 'bookworm.core.controllers', 'bookworm.core.filters'], function () {});

    angular.module('bookworm.book', ['bookworm.book.routes', 'bookworm.book.directives', 'bookworm.book.controllers'], function () {});

    angular.module('bookworm.author', ['bookworm.author.routes', 'bookworm.author.directives', 'bookworm.author.controllers'], function () {});

    angular.module('bookworm.release', ['bookworm.release.directives'], function () {});

    /* angular ui pagination patch */

    angular.module("template/pagination/pagination.html", []).run(["$templateCache", function($templateCache) {
        $templateCache.put("template/pagination/pagination.html",
            "<ul class=\"pagination pagination-sm\">\n" +
                "  <li ng-repeat=\"page in pages\" ng-class=\"{active: page.active, disabled: page.disabled}\"><a ng-click=\"selectPage(page.number)\">{{page.text}}</a></li>\n" +
                "</ul>\n" + "");
    }]);
    /* end patch*/


    // Define Main Module
    angular.module('bookworm', ['ngStorage', 'btford.socket-io', 'ui', 'ngAnimate', 'toaster', 'restangular', 'ngProgressLite', 'truncate', 'bookworm.core',
            'bookworm.book', 'bookworm.author', 'bookworm.release', 'bookworm.search', 'bookworm.log', 'bookworm.setting', 'bookworm.notify', 'bookworm.manage'],
            ['RestangularProvider', function (RestangularProvider) {
        RestangularProvider.setBaseUrl('/api/v1');
        RestangularProvider.setDefaultHeaders({'X-Requested-With': 'XMLHttpRequest'});

    }]).run(['$filter', 'Restangular', 'ngProgressLite', 'toaster', function ($filter, Restangular, ngProgressLite, toaster) {
        // Define Request Interceptor
        Restangular.setRequestInterceptor(function (element, operation) {
            ngProgressLite.start();
            if (_.isObject(element) && element['0']) {
                console.warn('Restangular not fixed yet, turning array back into array');
                element = _.toArray(element);
            }

            if (operation.toLowerCase() === 'put') {
                if (_.isArray(element)) {
                    element.forEach(function (item, index, arr) {
                        arr[index] = $filter('mask')(item, 'id,status');
                    });
                } else {
                    element = $filter('mask')(element, 'id,status');
                }
            }
            return element;
        });

        // Define Response Interceptor
        Restangular.setResponseInterceptor(function (response, operation) {
            ngProgressLite.done();
            var newResponse;
            if (operation === 'getList' && response.data) {
                newResponse = response.data;
                newResponse.metadata = response._metadata;
            } else {
                newResponse = response;
            }
            return newResponse;
        });

        // Define error interceptor
        Restangular.setErrorInterceptor(function (response) {
            ngProgressLite.done();
            toaster.pop('error', 'Error', response.data.message || response.status);
            return response;
        });

        // Define Element Transformers
        Restangular.addElementTransformer('authors', false, function (elem) {
            if (elem.books) {
                angular.forEach(elem.books, function (book) {
                    Restangular.restangularizeElement(elem, book, 'books');
                });
            }
            return elem;
        });

        Restangular.addElementTransformer('books', false, function (elem) {
            if (elem.releases) {
                angular.forEach(elem.releases, function (release) {
                    Restangular.restangularizeElement(elem, release, 'releases');
                });
            }
            return elem;
        });
    }]);



}(angular, _));