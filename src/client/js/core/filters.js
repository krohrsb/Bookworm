/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/30/13 4:16 PM
 */
/*global angular*/
(function (angular) {
    'use strict';
    var module = angular.module('bookworm.core.filters', []);

    /**
     * JSON Mask filter
     * @param {object} obj - The object we are masking
     * @param {string} maskString - The JSON Mask string to apply
     */
    module.filter('mask', ['$window', function ($window) {
        return function (obj, maskString) {
            if ($window.jsonMask && typeof maskString === 'string' && maskString.length) {
                return $window.jsonMask(obj, maskString);
            } else {
                return obj;
            }

        };
    }]);

    module.filter('moment', ['$window', function ($window) {
        return function (obj) {
            if ($window.moment) {
                return $window.moment(obj);
            } else {
                return obj;
            }
        };
    }]);

    /**
     * Dereferrer filter
     * Modifies a URL to use dereferrer.org with it.
     * @param {string} url - The URL to de-refer
     */
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

    /**
     * Slice filter
     * Helper to slice an array using a filter
     * @param {Array} arr - The array to slice
     * @param {number} begin - Start index
     * @param {number} end - End index
     */
    module.filter('slice', function () {
        return function (arr, begin, end) {
            if (!angular.isUndefined(arr) && angular.isArray(arr)) {
                return arr.slice(begin, end);
            } else {
                return arr;
            }

        };
    });

    /**
     * Paging filter
     * Slices up an array in a paging fashion using a page and limit.
     * @param {Array} arr - the array of 'items'
     * @param {number} currentPage - the current page you are on
     * @param {number} limit - the amount of items to show on your page.
     */
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
    module.filter('joinWithObjects', function () {
        return function (arr, delim) {
            var output;
            if (!angular.isUndefined(arr) && angular.isArray(arr)) {
                output = arr.map(function (value) {
                    if (angular.isObject(value)) {
                        return JSON.stringify(value);
                    } else {
                        return value;
                    }
                });
            } else {
                output = arr;
            }
            return output.join(delim || ', ');

        };
    });
}(angular));