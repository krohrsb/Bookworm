/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/24/13 8:56 AM
 */
/*global angular*/
(function (angular) {
    "use strict";
    var module = angular.module('bookworm.book.controllers', [], function () {});

    module.controller('BookCtrl', ['$scope', 'book', 'releases', 'socket', function ($scope, book, releases, socket) {
        socket.forward('book:update', $scope);
        socket.forward('release:update', $scope);
        socket.forward('release:create', $scope);
        $scope.book = book;
        $scope.releases = releases;


        $scope.$on('socket:book:update', function (ev, updatedBook) {
            if (ev.targetScope.book.id.toString() === updatedBook.id.toString()) {
                ev.targetScope.book.status = updatedBook.status;
                ev.targetScope.book.updated = updatedBook.updated;
            }
        });

        $scope.$on('socket:release:update', function (ev, updatedRelease) {
            var i, len, release;
            if (ev.targetScope.book.id.toString() === updatedRelease.bookId.toString()) {
                for (i = 0, len = ev.targetScope.releases.length; i < len; i = i + 1) {
                    release = ev.targetScope.releases[i];
                    if (release.id.toString() === updatedRelease.id.toString()) {
                        release.status = updatedRelease.status;
                        release.updated = updatedRelease.updated;
                        release.directory = updatedRelease.directory;
                        break;
                    }
                }
            }
        });

        $scope.$on('socket:release:create', function (ev, createdRelease) {
            if (ev.targetScope.book.id === createdRelease.bookId) {
                ev.targetScope.releases.unshift(createdRelease);
            }
        });

    }]);


    module.controller('WantedBooksCtrl', ['$scope', 'books', function ($scope, books) {
        $scope.books = books;

    }]);

    module.controller('BookListCtrl', ['$scope', 'Restangular', 'toaster', function ($scope, Restangular, toaster) {
        $scope.limit = 5;
        $scope.currentPage = 1;
        $scope.maxSize = 5;
        $scope.selecting = false;
        $scope.allSelected = false;
        $scope.filteredBooks = [];
        $scope.totalSelected = 0;
        $scope.showExcluded = false;
        $scope.statuses = ['excluded', 'downloaded', 'skipped', 'wanted'];
        $scope.selectingStatus = $scope.statuses[2];

        /**
         * Watch the selecting boolean
         * If selecting, increase the limit of books shown.
         */
        $scope.$watch('selecting', function (newVal) {
            if (newVal) {
                $scope.limit = 10;
            } else {
                $scope.toggleSelectAll(false);
                $scope.limit = 5;
            }
        });

        /**
         * Watch the books array
         * Calculate total selected
         */
        $scope.$watch('books', function (books) {
            $scope.totalItems = books.length;
            $scope.totalSelected = _.compact(_.pluck($scope.books, 'selected')).length;
        }, true);

        /**
         * Toggle selected state of all filtered books
         * @param {boolean} [select] - Force a selected state
         */
        $scope.toggleSelectAll = function (select) {

            if (typeof select !== 'undefined') {
                $scope.allSelected = select;
            } else {
                $scope.allSelected = !$scope.allSelected;
            }

            // first clear all selected (so when paging it will de-select)
            angular.forEach($scope.books, function (book) {
                book.selected = false;
            });
            // set current filtered books selected state
            angular.forEach($scope.filteredBooks, function (book) {
                if ($scope.showExcluded || book.status !== 'excluded') {
                    book.selected = $scope.allSelected;
                }
            });

        };

        /**
         * Set selected books status
         * @param {string} status - The status to set the books to.
         */
        $scope.setSelected = function (status) {
            var selectedBooks = [];
            angular.forEach($scope.filteredBooks, function (book) {
                if (book.selected) {
                    if (!angular.equals(book.status, status)) {
                        book.status = status;
                        selectedBooks.push(book);
                    }
                }
            });
            if (selectedBooks.length) {
                Restangular.all('books').customPUT(selectedBooks).then(function () {
                    toaster.pop('success', 'Updated', 'Finished updating ' + selectedBooks.length + ' book' + ((selectedBooks.length > 1) ? 's': '') + '.');
                });
            } else {
                toaster.pop('info', 'Info', 'No books selected. Select some books or make sure you are changing its status to something new.', 5000);
            }
        };

        $scope.bookFilter = function (book) {
            return !(!$scope.showExcluded && book.status === 'excluded');
        };

        $scope.toggleShowExcluded = function () {
            $scope.showExcluded = !$scope.showExcluded;
        };

        $scope.toggleSelecting = function () {
            $scope.selecting = !$scope.selecting;
        };
    }]);


}(angular));