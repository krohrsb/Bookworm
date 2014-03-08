/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/15/13 3:33 PM
 */

// Dependencies
var util = require('util');
var request = require('request');
var _ = require('lodash');
var Q = require('q');

// Local Dependencies
var Notifier = require('../notifier');
var settingService = require('../../setting');

/**
 * Pushover Notifier
 * @param options
 * @constructor
 */
var Pushover = function (options) {
    "use strict";

    this._url = 'https://api.pushover.net/1/messages.json';

    Notifier.call(this, options);
};


util.inherits(Pushover, Notifier);

/**
 * Parse the NMA response and return a formatted object
 * @param {object} response
 * @returns {Promise} A promise of type Promise<Object, Error>
 * @private
 */
Pushover.prototype._parseResponse = function (response) {
    "use strict";
    var deferred = Q.defer();

    if (response && response.errors) {
        deferred.resolve({
            success: false,
            message: response.errors[0],
            statusCode: 400
        });
    } else if (response && !response.errors) {
        deferred.resolve({
            success: true,
            message: 'success',
            statusCode: 200
        });
    } else {
        deferred.reject(new Error('could not parse pushover response'));
    }
    return deferred.promise;
};

/**
 * Notify using Pushover. Check if it should notify first, using the given event.
 * @param {string} trigger - Notification trigger
 * @param {object} book - book object
 * @returns {Promise} A promise of type Promise<Object, Error>
 */
Pushover.prototype.notify = function (trigger, book) {
    "use strict";
    var params;
    if (this.shouldNotify(trigger)) {
        params = {
            token: settingService.get('notifiers:pushover:apiKey'),
            user: settingService.get('notifiers:pushover:userKey'),
            priority: settingService.get('notifiers:pushover:priority'),
            message: this.getMessage(trigger, book),
            title: this._settings.application,
            url: book.apiLink,
            url_title: book.title + '@' + book.provider
        };

        return Q.nfcall(request, {
            uri: this._url,
            method: 'POST',
            json: true,
            form: params
        }).spread(function (http, response) {
            return response;
        }.bind(this)).then(this._parseResponse.bind(this)).then(function (response) {
            this.emit('notify', response);
        }.bind(this));
    } else {
        return Q.fcall(function () {
            return {
                success: false,
                message: 'notifier not enabled or trigger not set to notify'
            };
        }.bind(this)).then(function (response) {
            return response;
        }.bind(this));
    }

};

module.exports = Pushover;