/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/24/13 8:56 AM
 */
/*global angular*/
(function (angular) {
    "use strict";
    var module = angular.module('bookworm.core.services', [], function () {});

    module.service('guid', function () {
        var s4, guid;

        /**
         * Generate random-ish substring.
         * @returns {string}
         */
        s4 = function () {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        };

        /**
         * Generate multiple random-ish substrings.
         * @returns {string}
         */
        guid = function () {
            var id = '', i;
            for (i = 0; i < 8; i = i + 1) {
                id = id + s4();
            }
            return id;
        };

        this.generate = guid;
    });
}(angular));