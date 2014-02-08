/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/15/13 3:33 PM
 */

// Dependencies
var util = require('util');
var request = require('request');
var _ = require('lodash');
var Q = require('q');
var xml2js = require('xml2js');

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

    this._url = 'https://www.notifymyandroid.com/publicapi/notify';

    Notifier.call(this, options);
};

util.inherits(NotifyMyAndroid, Notifier);

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
            statusCode: response.nma.error[0].$.code
        });
    } else if (response.nma && response.nma.success) {
        deferred.resolve({
            success: true,
            message: 'success',
            statusCode: response.nma.success[0].$.code
        });
    } else {
        deferred.reject(new Error('could not parse nma response'));
    }
    return deferred.promise;
};

/**
 * Notify using NMA. Check if it should notify first, using the given event.
 * @param {string} trigger - Notification trigger
 * @param {object} book - book object
 * @returns {Promise} A promise of type Promise<Object, Error>
 */
NotifyMyAndroid.prototype.notify = function (trigger, book) {
    "use strict";
    var params;

    if (this.shouldNotify(trigger)) {
        params = {
            apikey: settingService.get('notifiers:nma:apiKey'),
            priority: settingService.get('notifiers:nma:priority'),
            description: this.getMessage(trigger, book),
            event: this.getMessage(trigger, book),
            application: this._settings.application
        };

        return Q.nfcall(request, {
            uri: this._url,
            method: 'POST',
            form: params
        }).spread(function (http, response) {
            if (response) {
                return Q.ninvoke(xml2js, 'parseString', response).then(function (response) {
                    this.emit('notify', response);
                    return response;
                }.bind(this));
            } else {
                throw new Error('empty response from NMA');
            }
        }.bind(this)).then(this._parseResponse.bind(this));
    } else {
        return Q.fcall(function () {
            return {
                success: false,
                message: 'notifier not enabled or trigger not set to notify'
            };
        }.bind(this)).then(function (response) {
            this.emit('notify', response);
            return response;
        }.bind(this));
    }

};

module.exports = NotifyMyAndroid;