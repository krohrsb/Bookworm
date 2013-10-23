/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/15/13 3:33 PM
 */

// Dependencies
var util = require('util');
var request = require('request');
var parseXml = require('xml2js').parseString;
var _ = require('lodash');
var Q = require('q');

// Local Dependencies
var Notifier = require('../notifier');
var settingService = require('../../setting');

/**
 * Notify My Android Notifier
 * @param options
 * @constructor
 */
var NotifyMyAndroid = function (options) {
    "use strict";

    this._rootUrl = 'https://www.notifymyandroid.com/publicapi/';
    this._notifyUrl = this._rootUrl + 'notify';
    this._verifyUrl = this._rootUrl + 'verify';

    Notifier.call(this, options);
};

util.inherits(NotifyMyAndroid, Notifier);

/**
 * Determine if this notifier should notify based on a given trigger.
 * @param {string} trigger - The name of an arbitrary trigger
 * @returns {boolean}
 */
NotifyMyAndroid.prototype.shouldNotify = function (trigger) {
    "use strict";
    if (trigger === 'snatched') {
        return settingService.get('notifiers:nma:onSnatched');
    } else if (trigger === 'download') {
        return settingService.get('notifiers:nma:onDownload');
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
NotifyMyAndroid.prototype._parseResponse = function (response) {
    "use strict";
    var deferred = Q.defer();

    if (response.nma && response.nma.error) {
        deferred.resolve({
            success: false,
            message: response.nma.error[0]._,
            enabled: this._isEnabled,
            statusCode: response.nma.error[0].$.code
        });
    } else if (response.nma && response.nma.success) {
        deferred.resolve({
            success: true,
            message: 'success',
            enabled: this._isEnabled,
            statusCode: response.nma.success[0].$.code
        });
    } else {
        deferred.reject(new Error('could not parse nma response'));
    }
    return deferred.promise;
};

/**
 * Verify the NMA configuration by pinging their server's verification url.
 * @returns {Promise} A promise of type Promise<Object, Error>
 */
NotifyMyAndroid.prototype.verify = function () {
    "use strict";

    return Q.nfcall(request, {
        uri: this._verifyUrl,
        method: 'GET',
        qs: {
            apikey: settingService.get('notifiers:nma:apiKey')
        }
    })
    .then(function (body) {
        if (body && body[1]) {
            return Q.nfcall(parseXml, body[1]).then(function (response) {
                this.emit('verify', response);
                return response;
            }.bind(this));
        } else {
            throw new Error('empty response from NMA');
        }

    }.bind(this)).then(this._parseResponse.bind(this));
};

/**
 * Notify using NMA. Check if it should notify first, using the given event.
 * @param {object} options - Notification options
 * @returns {Promise} A promise of type Promise<Object, Error>
 */
NotifyMyAndroid.prototype.notify = function (options) {
    "use strict";
    var defaults, settings;

    if (this.shouldNotify(options.trigger)) {
        defaults = {
            apikey: settingService.get('notifiers:nma:apiKey'),
            priority: settingService.get('notifiers:nma:priority'),
            description: this._settings.description,
            event: this._settings.event,
            application: this._settings.application
        };

        settings = _.merge({}, defaults, options || {});

        return Q.nfcall(request, {
            uri: this._notifyUrl,
            method: 'POST',
            form: settings
        }).then(function (body) {
            if (body && body[1]) {
                return Q.nfcall(parseXml, body[1]).then(function (response) {
                    this.emit('notify', response);
                    return response;
                });
            } else {
                throw new Error('empty response from NMA');
            }
        }).then(this._parseResponse.bind(this));
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

/**
 * toJSON this notifier
 * @returns {object}
 */
NotifyMyAndroid.prototype.toJSON = function () {
    "use strict";
    return _.merge({}, Notifier.prototype.toJSON.call(this), {
        name: this._name,
        rootUrl: this._rootUrl,
        verifyUrl: this._verifyUrl,
        notifyUrl: this._notifyUrl
    });
};

module.exports = NotifyMyAndroid;