/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/24/13 11:35 AM
 */
/*global angular*/
(function (angular) {
    'use strict';
    var module = angular.module('bookworm.setting.directives', [], function () {});
    module.directive('bwSetting', ['$filter', '$timeout', 'Restangular', 'toaster', function ($filter, $timeout, Restangular, toaster) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, element, attrs, ngModel) {
                var mask, save, flashClass, masked, flashToken;

                masked = null;
                flashToken = null;

                mask = attrs.ngModel.split('[')[0].split('.').slice(1).join('/');

                scope.$on('setting:populate', function (ev, key) {
                    if (attrs.ngModel === key) {
                        ngModel.$pristine = false;
                        ngModel.$dirty = true;
                        element[0].focus();
                    }
                });
                /**
                 * Flash a class for a period of time.
                 * @param {string} klass - the class to add to the form-group
                 */
                flashClass = function (klass, duration) {
                    var elem = element.parents('.form-group');
                    if (flashToken) {
                        elem.removeClass(klass);
                        $timeout.cancel(flashToken);
                    }
                    elem.addClass(klass);
                    if (duration) {
                        flashToken = $timeout(function () {
                            elem.removeClass('has-success has-warning has-error');
                        }, duration);
                    }

                };

                /**
                 * Try to save the setting.
                 */
                save = function () {
                    if (ngModel.$dirty && ngModel.$valid) {
                        Restangular.all('settings').customPUT($filter('mask')(scope.settings, mask)).then(function () {
                            flashClass('has-success', 3000);
                            ngModel.$setPristine();
                        }, function (err) {
                            toaster.pop('error', 'Error', err.data.message);
                            flashClass('has-error');
                        });
                    } else if (ngModel.$invalid) {
                        flashClass('has-warning');
                        $timeout(function () {
                            toaster.pop('warning', 'Invalid', (attrs.invalidText || 'Field not valid'));
                        }, 0);

                    }
                };
                //bind
                if (element.prop('tagName').toLowerCase() === 'select') {
                    element.bind('change', save);
                } else if (attrs.type === 'checkbox') {
                    element.bind('click', save);
                } else {
                    element.bind('blur', save);
                }


            }
        };
    }]);
}(angular));