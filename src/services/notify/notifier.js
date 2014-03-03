/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/15/13 3:35 PM
 */

// Dependencies
var events = require('events');
var util = require('util');
var _ = require('lodash');
var Q = require('q');

// Local Dependencies
var notifierDefaults = require('./notifier-defaults');
var logger = require('../log');
var settingService = require('../setting');

var Notifier = function (options) {
    "use strict";
    this._settings = _.merge({}, notifierDefaults, options || {});

    if (_.isEmpty(this._settings.name)) {
        throw new Error('Notifier created without a name!');
    }

    events.EventEmitter.call(this);
};

util.inherits(Notifier, events.EventEmitter);

/**
 * Retrieve the name of the notifier;
 * @returns {string}
 */
Notifier.prototype.getName = function () {
    "use strict";
    return this._settings.name;
};

/**
 * Determine if notifier should notify given an trigger. Should be overridden.
 * @returns {boolean}
 */
Notifier.prototype.shouldNotify = function (trigger) {
    "use strict";
    if (settingService.get('notifiers:' + this._settings.name + ':enabled')) {
        if (trigger === 'snatched') {
            return settingService.get('notifiers:' + this._settings.name + ':onSnatch');
        } else if (trigger === 'downloaded') {
            return settingService.get('notifiers:' + this._settings.name + ':onDownload');
        } else {
            return true;
        }
    } else {
        return false;
    }

};

Notifier.prototype.getMessage = function (trigger, book) {
    "use strict";
    return 'Book ' + book.title + ' was ' + trigger;
};
/**
 * Notify, meant to be overridden, abstract.
 * @returns {Promise} A promise of type Promise<>
 */
Notifier.prototype.notify = function () {
    'use strict';
    return Q.defer().promise;
};

/**
 * toString the notifier
 * @returns {string}
 */
Notifier.prototype.toString = function () {
    "use strict";
    //noinspection JSHint
    return Q(this._settings.name);
};

/**
 * toJSON the notifier
 * @returns {object}
 */
Notifier.prototype.toJSON = function () {
    "use strict";
    return _.merge({}, {
        url: this._url
    }, this._settings);
};

module.exports = Notifier;