/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/24/13 8:56 AM
 */
/*global angular*/
(function (angular) {
    "use strict";
    var module = angular.module('bookworm.book.controllers', [], function () {});

    /**
     * Book Controller. For a singular book.
     * Real simple, simply grabs and defines the book. Most of the book logic is in its directive.
     * @param {object} $scope - The scope
     * @param {object} book - The book data.
     */
    module.controller('BookCtrl', ['$scope', 'book', function ($scope, book) {
        $scope.book = book;
    }]);


    /**
     * Books Controller. For the book listing pages.
     * @param {object} $scope - The scope
     * @param {object} $stateParams - Angular UI Router state params
     * @param {object[]} books - An array of book objects
     */
    module.controller('BooksCtrl', ['$scope', '$stateParams', 'books', function ($scope, $stateParams, books) {
        // store reference to books
        $scope.books = books;
        // set the status to display, default to All
        $scope.status = $stateParams.status || 'All';
        // when status is excluded set the default showIgnoreStatus to true so that you can actually see them.
        if ($scope.status === 'excluded') {
            $scope.showIgnoreStatus = true;
        }

    }]);

    /**
     * Book List Controller. For listing books.
     * @param {object} $scope - The scope
     * @param {object} Restangular - Restangular instance
     * @param {object} toaster - Toaster instance
     */
    module.controller('BookListCtrl', ['$scope', 'Restangular', 'toaster', '$localStorage', function ($scope, Restangular, toaster, $localStorage) {


        // if show ignore status wasn't defined by a parent controller, default to false.
        if (typeof $scope.showIgnoreStatus === 'undefined') {
            $scope.showIgnoreStatus = false;
        }

        $scope.$storage = $localStorage.$default({
            showIgnoreStatus: $scope.showIgnoreStatus,
            selecting: false
        });

        /**
         * Indicates if we are to show the ignored status or not.
         * @type {boolean}
         */
        $scope.showIgnoreStatus = $scope.$storage.showIgnoreStatus;
        /**
         * Indicates if we are in multi-select mode
         * @type {boolean}
         */
        $scope.selecting = $scope.$storage.selecting;

        /**
         * The amount of books to show on one page.
         * @type {number}
         */
        $scope.limit = 5;
        /**
         * The current page number.
         * @type {number}
         */
        $scope.currentPage = 1;
        /**
         * The maximum amount of 'pages' the pager will show.
         * @type {number}
         */
        $scope.maxSize = 5;
        /**
         * Reference to the list of filtered books
         * @type {Array}
         */
        $scope.filteredBooks = [];
        /**
         * Total amount of selected books (when selecting)
         * @type {number}
         */
        $scope.totalSelected = 0;

        /**
         * The ignore status (for show/hide toggle)
         * @type {string}
         */
        $scope.ignoreStatus = 'excluded';
        /**
         * List of valid book statuses.
         * @type {Array}
         */
        $scope.statuses = ['skipped', 'excluded', 'downloaded', 'wanted'];

        /**
         * Watch selecting for change.
         * When toggled use selecting boolean to alter the limit of items shown.
         * @param {boolean} selecting - Indicates if we are 'selecting' or not (multiple items)
         */
        $scope.$watch('selecting', function (selecting) {
            $scope.$storage.selecting = selecting;
            $scope.limit = ((selecting) ? 10 : 5);
        });

        /**
         * Watch and update local storage.
         */
        $scope.$watch('showIgnoreStatus', function (show) {
            $scope.$storage.showIgnoreStatus = show;
        });

        /**
         * Watch the books array
         * Calculate total selected and total items.
         * Doing deep check to trigger on individual book updates (for selected)
         */
        $scope.$watch('books', function (books) {
            if (books) {
                $scope.totalItems = books.length;
                $scope.totalSelected = _.compact(_.pluck($scope.books, 'selected')).length;
            }
        }, true);

        /**
         * Toggle selected state of all filtered books
         * @param {boolean} select - The select state to enforce
         */
        $scope.toggleSelectAll = function (select) {

            // first clear all selected (so when paging it will de-select)
            angular.forEach($scope.books, function (book) {
                book.selected = false;
            });
            // set current filtered books selected state
            // only select visible/applicable books
            angular.forEach($scope.filteredBooks, function (book) {
                if ($scope.showIgnoreStatus || book.status !== $scope.ignoreStatus) {
                    book.selected = select;
                }
            });

        };

        /**
         * Set selected books status
         * @param {string} status - The status to set the books to.
         */
        $scope.setSelected = function (status) {
            var selectedBooks = [];
            //go through filtered books for all selected. If their status is to change, push it to the working array.
            angular.forEach($scope.filteredBooks, function (book) {
                if (book.selected) {
                    if (!angular.equals(book.status, status)) {
                        book.status = status;
                        selectedBooks.push(book);
                        if (status === $scope.ignoreStatus) {
                            book.selected = false;
                        }
                    }
                }
            });
            // if we have books to put, otherwise tell the user they don't
            if (selectedBooks.length) {
                Restangular.all('books').customPUT(selectedBooks).then(function () {
                    toaster.pop('success', 'Updated', 'Finished updating ' + selectedBooks.length + ' book' + ((selectedBooks.length > 1) ? 's': '') + '.');
                });
            } else {
                toaster.pop('info', 'Info', 'No books selected. Select some books or make sure you are changing its status to something new.', 5000);
            }
        };

        /**
         * Filter books using custom criteria
         * @param {object} book - A book object
         * @returns {boolean} True will pass, false will filter out.
         */
        $scope.bookFilter = function (book) {
            // this filters out ignored books by status
            return !(!$scope.showIgnoreStatus && book.status === $scope.ignoreStatus);
        };
    }]);


}(angular));