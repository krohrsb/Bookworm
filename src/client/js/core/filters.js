/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/30/13 4:16 PM
 */
/*global angular*/
(function (angular, mask) {
    'use strict';
    var module = angular.module('bookworm.core.filters', []);

    module.filter('mask', function () {
        return function (obj, maskString) {
            if (typeof maskString === 'string' && maskString.length) {
                return mask(obj, maskString);
            } else {
                return obj;
            }

        };
    });

    module.filter('dereferrer', ['$window', function ($window) {
        return function (url) {
            var dereferrer;
            dereferrer = 'http://www.dereferer.org/?';
            if (!angular.isUndefined(url)) {
                return dereferrer + $window.encodeURI(url);
            } else {
                return url;
            }
        };
    }]);

    module.filter('slice', function () {
        return function (arr, begin, end) {
            if (!angular.isUndefined(arr) && angular.isArray(arr)) {
                return arr.slice(begin, end);
            } else {
                return arr;
            }

        };
    });

    module.filter('page', function () {
        return function (arr, currentPage, limit) {
            var start;
            if (!angular.isUndefined(arr) && angular.isArray(arr)) {
                start = (currentPage - 1) * limit;
                return arr.slice(start, start + limit);
            } else {
                return arr;
            }

        };
    });
}(angular, jsonMask));