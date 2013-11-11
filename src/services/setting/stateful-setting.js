/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/21/13 8:56 AM
 */

// Dependencies
var events = require('events');
var util = require('util');
var _ = require('lodash');

var settingService = require('./index');

var StatefulSetting = function (options) {
    "use strict";

    this._options = _.clone(options, true);

    this._keys = [];

    events.EventEmitter.call(this);

    this._settings = this._iterate(this._options, true);

    settingService.on('set', function (key) {
        if (_.contains(this._keys, key)) {
            this._settings = this._iterate(this._options, false);
            this.emit('updated', this._settings);
        }
    }.bind(this));
};

util.inherits(StatefulSetting, events.EventEmitter);


/**
 * Iterate over the object recursively, for each string value attempt to replace with the settings value given that key.
 * @param {object} obj - object containing setting keys as values.
 * @param {object} storeKeys - keys to iterate
 * @private
 */
StatefulSetting.prototype._iterate = function (obj, storeKeys) {
    "use strict";
    var settingValue;
    if (obj) {
        obj = _.clone(obj, true);
        _.forIn(obj, function(value, key) {
            if (_.isObject(value)) {
                obj[key] = this._iterate(value, storeKeys);
            } else if (_.isString(value)) {
                settingValue = settingService.get(value);
                if (!_.isUndefined(settingValue)) {
                    if (storeKeys) {
                        this._keys.push(value);
                    }
                    obj[key] = settingValue;
                }
            }
        }.bind(this));
    }
    return obj;
};

/**
 * Retrieve the settings object.
 * @returns {object}
 */
StatefulSetting.prototype.get = function () {
    "use strict";
    return this._settings;
};
module.exports = StatefulSetting;