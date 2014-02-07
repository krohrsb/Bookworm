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
 * Determine if this notifier should notify based on a given trigger.
 * @param {string} trigger - The name of an arbitrary trigger
 * @returns {boolean}
 */
Pushover.prototype.shouldNotify = function (trigger) {
    "use strict";
    if (trigger === 'snatched') {
        return settingService.get('notifiers:pushover:onSnatched');
    } else if (trigger === 'download') {
        return settingService.get('notifiers:pushover:onDownload');
    } else {
        return true;
    }
};

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
            enabled: this._isEnabled,
            statusCode: 400
        });
    } else if (response && !response.errors) {
        deferred.resolve({
            success: true,
            message: 'success',
            enabled: this._isEnabled,
            statusCode: 200
        });
    } else {
        deferred.reject(new Error('could not parse pushover response'));
    }
    return deferred.promise;
};

/**
 * Notify using Pushover. Check if it should notify first, using the given event.
 * @param {object} options - Notification options
 * @returns {Promise} A promise of type Promise<Object, Error>
 */
Pushover.prototype.notify = function (options) {
    "use strict";
    var defaults, settings;

    if (this.shouldNotify(options.trigger)) {
        defaults = {
            token: 'aTCRvqTWvwkeAihuRQHVXyboVKbLef',
            user: settingService.get('notifiers:pushover:apiKey'),
            priority: settingService.get('notifiers:pushover:priority'),
            message: this._settings.event + '. ' + this._settings.description,
            title: this._settings.application,
            url: this._settings.url,
            url_title: this._settings.urlTitle
        };

        settings = _.merge({}, defaults, options || {});

        return Q.nfcall(request, {
            uri: this._url,
            method: 'POST',
            json: true,
            form: settings
        }).spread(function (http, response) {
            if (response) {
                this.emit('notify', response);
                return response;
            } else {
                throw new Error('empty response from pushover');
            }
        }.bind(this)).then(this._parseResponse.bind(this));
    } else {
        return Q.fcall(function () {
            return {
                success: false,
                enabled: this._isEnabled,
                message: 'trigger not set to notify'
            };
        }.bind(this)).then(function (response) {
            this.emit('notify', response);
            return response;
        }.bind(this));
    }

};

module.exports = Pushover;