/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/24/13 8:56 AM
 */
/*global angular*/
(function (angular) {
    'use strict';
    var module = angular.module('bookworm.log.routes', [], function () {});

    module.config(['$stateProvider', function ($stateProvider) {

        $stateProvider
            .state('logs', {
                url: '/logs',
                templateUrl: 'partials/logs/index',
                controller: 'LogsCtrl'
            });
    }]);
}(angular));