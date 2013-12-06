/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/24/13 8:56 AM
 */
/*global angular*/
(function (angular) {
    "use strict";
    var module = angular.module('bookworm.log.controllers', [], function () {});

    module.controller('LogsCtrl', ['$scope', 'Restangular', 'socket', function ($scope, Restangular, socket) {
        var logs;
        //forward log socket.io event
        socket.forward('log', $scope);

        /**
         * Number of log items to show per page
         * @type {number}
         */
        $scope.limit = 20;
        /**
         * Current page we are on
         * @type {number}
         */
        $scope.currentPage = 1;
        /**
         * Number of 'pages' in pager to show.
         * @type {number}
         */
        $scope.maxSize = 5;

        /**
         * Reference to restangular logs
         * @type {object}
         */
        logs = Restangular.all('logs');

        /**
         * Retrieve logs using specified limit
         */
        logs.getList({limit: $scope.limit}).then(function (data) {
            // set data, total items and new limit from server.
            $scope.logs = data;
            $scope.totalItems = data.metadata.total;
            $scope.limit = data.metadata.limit;
        });

        /**
         * On page change
         * @param {number} page - new page number
         */
        $scope.onSelectPage = function (page) {
            if (!angular.equals(page, $scope.currentPage)) {
                logs.getList({
                    offset: (page - 1) * $scope.logs.metadata.limit,
                    limit: $scope.logs.metadata.limit
                }).then(function (data) {
                        $scope.logs = data;
                        $scope.totalItems = data.metadata.total;
                    });
            }
        };

        /**
         * Listen for socket.io log event to populate new logs automatically.
         */
        $scope.$on('socket:log', function (ev, log) {
            if (log) {
                if (($scope.logs.length + 1) > $scope.limit) {
                    $scope.logs.pop();
                }
                $scope.logs.unshift(log);
                $scope.totalItems = $scope.totalItems + 1;
            }
        });

    }]);

}(angular));