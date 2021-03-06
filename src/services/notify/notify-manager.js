/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/15/13 3:55 PM
 */

// Dependencies
var events = require('events');
var util = require('util');
var _ = require('lodash');

// Local Dependencies


var NotificationService = function () {
    "use strict";
    this._notifiers = [];


    events.EventEmitter.call(this);
};

util.inherits(NotificationService, events.EventEmitter);

/**
 * Retrieve all the notifiers;
 * @returns {Array}
 */
NotificationService.prototype.getNotifiers = function () {
    "use strict";
    return this._notifiers;
};

/**
 * Retrieve a notifier by name.
 * @param {string} name - The name of the notifier
 * @returns {null|object}
 */
NotificationService.prototype.getNotifier = function (name) {
    'use strict';

    return _.find(this._notifiers, function (notifier) {
        return notifier.getName() === name;
    });
};

/**
 * Add a notifier
 * @param {object} notifier - The notifier object
 * @returns {null|object}
 */
NotificationService.prototype.addNotifier = function (notifier) {
    'use strict';

    if (notifier) {
        this._notifiers.push(notifier);
        notifier.on('notify', function (data) {
            this.emit('notify', data);
        }.bind(this));
        return notifier;
    } else {
        return notifier;
    }
};

/**
 * Notify all notifiers, let them decide if they should notify or not.
 */
NotificationService.prototype.notify = function (trigger, book) {
    'use strict';

    _.invoke(this._notifiers, 'notify', trigger, book);
};

module.exports = NotificationService;