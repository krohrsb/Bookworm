/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/24/13 8:56 AM
 */
/*global angular*/
(function (angular) {
    "use strict";
    var module = angular.module('bookworm.author.controllers', [], function () {});

    /**
     * Author Controller. For a singular author.
     * Real simple, simply grabs and defines the author. Most of the author logic is in its directive.
     * @param {object} $scope - The scope
     * @param {object} author - The author data.
     */
    module.controller('AuthorCtrl', ['$scope', 'socket', 'author', function ($scope, socket, author) {
        $scope.author = author;

        // separate author.books so we can use book list separately
        $scope.$watch('author.books', function (books) {
            if (books) {
                $scope.books = books;
            }
        });

    }]);

    /**
     * Authors Controller. For the authors listing page.
     * @param {object} $scope - The scope
     * @param {object[]} authors - An array of author objects
     */
    module.controller('AuthorsCtrl', ['$scope', 'authors', function ($scope, authors) {
        $scope.authors = authors;
    }]);

    /**
     * Author List Controller. For listing authors.
     * @param {object} $scope - The scope
     * @param {object} Restangular - Restangular instance
     * @param {object} toaster - Toaster instance
     */
    module.controller('AuthorListCtrl', ['$scope', 'Restangular', 'toaster', '$localStorage', '$modal', function ($scope, Restangular, toaster, $localStorage, $modal) {

        /**
         * Local Storage
         * @type {object}
         */
        $scope.$storage = $localStorage.$default({
            showIgnoreStatus: false,
            selecting: false
        });

        /**
         * Sort predicate
         * @type {string}
         */
        $scope.predicate = 'name';

        /**
         * Sort direction
         * @type {boolean}
         */
        $scope.reverse = false;

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
         * The amount of authors to show on one page.
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
         * Reference to the list of filtered authors
         * @type {Array}
         */
        $scope.filteredAuthors = [];
        /**
         * Total amount of selected authors (when selecting)
         * @type {number}
         */
        $scope.totalSelected = 0;
        /**
         * The ignore status (for show/hide toggle)
         * @type {string}
         */
        $scope.ignoreStatus = 'paused';
        /**
         * List of valid author statuses.
         * @type {Array}
         */
        $scope.statuses = ['active', 'paused'];

        /**
         * Filter object used to filter authors.
         * @type {object}
         */
        $scope.filterObject = {
            name: '',
            status: ''
        };

        /**
         * Indicates if filtering or not.
         * @type {boolean}
         */
        $scope.filtering = false;

        // watch the filtered object for changes to calculate if we are filtering.
        $scope.$watch('filterObject', function (obj) {
            var filtering = false;
            angular.forEach(obj, function (value) {
                if (value !== '') {
                    filtering = true;
                }
            });
            $scope.filtering = filtering;
        }, true);

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
         * Watch the authors array
         * Calculate total selected and total items.
         * Doing deep check to trigger on individual author updates (for selected)
         */
        $scope.$watch('authors', function (authors) {
            if (authors) {
                $scope.totalItems = authors.length;
                $scope.totalSelected = _.compact(_.pluck($scope.authors, 'selected')).length;
            }

        }, true);

        /**
         * Toggle selected state of all filtered authors
         * @param {boolean} select - The select state to enforce
         */
        $scope.toggleSelectAll = function (select) {

            // first clear all selected (so when paging it will de-select)
            angular.forEach($scope.authors, function (author) {
                author.selected = false;
            });
            // set current filtered author selected state
            angular.forEach($scope.filteredAuthors, function (author) {
                if ($scope.$storage.showIgnoreStatus || author.status !== $scope.ignoreStatus) {
                    author.selected = select;
                }
            });

        };

        /**
         * Set selected authors status
         * @param {string} status - The status to set the authors to.
         */
        $scope.setSelected = function (status) {
            var selectedAuthors = [];
            angular.forEach($scope.filteredAuthors, function (author) {
                if (author.selected) {
                    if (!angular.equals(author.status, status)) {
                        author.status = status;
                        selectedAuthors.push(author);
                    }
                }
            });
            if (selectedAuthors.length) {
                Restangular.all('authors').customPUT(selectedAuthors).then(function () {
                    toaster.pop('success', 'Updated', 'Finished updating ' + selectedAuthors.length + ' author' + ((selectedAuthors.length > 1) ? 's': '') + '.');
                });
            } else {
                toaster.pop('info', 'Info', 'No authors selected. Select some authors or make sure you are changing their status to something new.', 5000);
            }
        };

        /**
         * Filter authors using custom criteria
         * @param {object} author - A author object
         * @returns {boolean} True will pass, false will filter out.
         */
        $scope.authorFilter = function (author) {
            return !(!$scope.$storage.showIgnoreStatus && author.status === $scope.ignoreStatus);
        };

        /**
         * Open the filter modal.
         */
        $scope.openFilter = function () {
            $modal.open({
                templateUrl: 'partials/templates/filter-modal',
                controller: 'FilterModalInstanceCtrl',
                backdrop: false,
                resolve: {
                    filterObject: function () {
                        return $scope.filterObject;
                    },
                    customFilterObject: function () {
                        return {};
                    },
                    statuses: function () {
                        return $scope.statuses;
                    }
                }
            });
        };

    }]);

    module.controller('ModalConfirmInstanceCtrl', ['$scope', '$modalInstance', 'options', function ($scope, $modalInstance, options) {
        $scope.message = options.message;

        $scope.ok = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);
}(angular));