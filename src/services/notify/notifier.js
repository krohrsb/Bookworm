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

var Notifier = function (options) {
    "use strict";
    this._settings = _.merge({}, notifierDefaults, options || {});
    if (_.isEmpty(this._settings.name)) {
        this._settings.name = _.uniqueId('notifier_');
    }
    this._isEnabled = true;

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
 * Disable the notifier
 */
Notifier.prototype.disable = function () {
    'use strict';

    this._isEnabled = false;
};

/**
 * Enable the notifier
 */
Notifier.prototype.enable = function () {
    'use strict';

    this._isEnabled = true;
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
 * Verify, meant to be overridden, abstract.
 * @returns {Promise} A promise of type Promise<>
 */
Notifier.prototype.verify = function () {
    'use strict';
    return Q.defer().promise;
};

/**
 * Determine if notifier should notify given an trigger. Should be overridden.
 * @returns {boolean}
 */
Notifier.prototype.shouldNotify = function () {
    "use strict";
    return false;
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
        isEnabled: this._isEnabled
    }, this._settings);
};

module.exports = Notifier;