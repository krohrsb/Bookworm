/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/24/13 11:35 AM
 */
/*global angular*/
(function (angular) {
    'use strict';
    var module;
    module = angular.module('bookworm.author.directives', [], function () {});
    module.directive('bwAuthor', ['Restangular', 'toaster', function (Restangular, toaster) {
        return {
            restrict: 'A',
            replace: true,
            transclude: true,
            templateUrl: 'partials/templates/author',
            scope: {
                author: '=',
                expanded: '='
            },
            link: function(scope) {
                scope.updateStatus = function (status, author) {
                    author.status = status;
                    author.put().then(function (updatedAuthor) {
                        scope.author = updatedAuthor;
                        angular.forEach(scope.author.books, function (book) {
                            Restangular.restangularizeElement(scope.author, book, 'books');
                        });
                    });
                };
                scope.checkNewBooks = function () {
                    toaster.pop('info', 'Running...', 'Checking for new books...');
                    Restangular.all('actions').one('authors', scope.author.id).customPOST({action: 'refreshAuthorNewBooks'});
                };

                scope.refreshAuthor = function () {
                    toaster.pop('info', 'Running...', 'Refreshing author and book information...');
                    Restangular.all('actions').one('authors', scope.author.id).customPOST({action: 'refreshAuthor'});
                };
            }
        };
    }]);
}(angular));