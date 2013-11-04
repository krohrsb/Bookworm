/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/24/13 11:35 AM
 */
/*global angular*/
(function (angular) {
    'use strict';
    var module;
    module = angular.module('bookworm.author.directives', [], function () {});
    module.directive('bwAuthor', ['Restangular', function (Restangular) {
        return {
            restrict: 'A',
            replace: true,
            transclude: true,
            templateUrl: 'partials/templates/author',
            scope: {
                author: '=',
                expanded: '='
            },
            link: function(scope, element, attrs) {
                scope.updateStatus = function (status, author) {
                    author.status = status;
                    author.put({expand: 'books'}).then(function (updatedAuthor) {
                        scope.author = updatedAuthor;
                        angular.forEach(scope.author.books, function (book) {
                            Restangular.restangularizeElement(scope.author, book, 'books');
                        });
                    });
                };
            }
        };
    }]);
}(angular));