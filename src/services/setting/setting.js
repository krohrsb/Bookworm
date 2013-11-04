/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/11/13 4:21 PM
 * @module setting
 */

// Dependencies
var _ = require('lodash');
var events = require('events');
var util = require('util');
var fs = require('fs-extra');
var nconf = require('nconf');
var os = require('os');
var path = require('path');
var Q = require('q');

/**
 * Settings Service to get/set settings for the application. Includes optional set validation.
 * @param {object} settingDefaults - setting defaults object
 * @constructor
 * @alias module:setting
 */
var SettingsService = function (settingDefaults) {
    "use strict";
    /** @type {object} **/
    this._validations = {};
    /** @type {object} **/
    this._fileStore = null;
    /** @type {object} **/
    this._memoryStore = null;
    /** @type {object} **/
    this._settingDefaults = settingDefaults;

    this.initialize();

    events.EventEmitter.call(this);
};

util.inherits(SettingsService, events.EventEmitter);

/**
 * Initialize the Stores
 * @function
 */
SettingsService.prototype.initialize = function () {
    "use strict";
    var base, configFile;

    this._memoryStore = new nconf.Provider();
    this._memoryStore.use('memory');
    this._fileStore = new nconf.Provider();
    this._fileStore.env().argv();

    base = path.resolve(path.dirname(require.main.filename), '..');

    configFile = path.join(base, 'config', this._fileStore.get('NODE_ENV') || 'development' + '.json');

    if (!fs.existsSync(configFile)) {
        fs.outputFileSync(configFile, '{}');
    }

    this._fileStore.file(configFile);

    this._fileStore.defaults(this._settingDefaults);

    this._memoryStore.set('environment:env', this._fileStore.get('NODE_ENV') || 'development');
    this._memoryStore.set('environment:configFile', configFile);
    this._memoryStore.set('environment:baseDirectory', base);
    this._memoryStore.set('environment:package', fs.readJSONSync(path.join(base, 'package.json')));
    this._memoryStore.set('environment:userAgent', 'Bookworm/' + this._memoryStore.get('environment:package').version.replace(' ', '-') + ' (' + os.platform() + ' ' + os.release() + ')');

};
/**
 * Save the configuration to disk
 * @returns {Promise} A promise of type Promise<, Error>
 */
SettingsService.prototype.save = function () {
    'use strict';
    return Q.ninvoke(this._fileStore, 'save');
};


/**
 * Set a config key with the specified value, with validation
 * @param {string} key - The config key to set
 * @param {*} value - The config value
 * @return {Array} An array given the set result, [error, msg}
 */
SettingsService.prototype.set = function (key, value) {
    'use strict';

    var result, store;

    if (!_.isEmpty(key)) {

        if (key.indexOf('environment') === 0) {
            store = this._memoryStore;
        } else {
            store = this._fileStore;
        }

        if (this._validations[key]) {
            result = this._validations[key](value);
            if (!result[0]) {
                if (!_.isEqual(store.get.call(store, key), value)) {
                    store.set.call(store, key, value);
                    this.emit('set', key, value);
                }
            }
            return result;
        } else {
            if (!_.isEqual(store.get.call(store, key), value)) {
                store.set.call(store, key, value);
                this.emit('set', key, value);
            }
            return [null];
        }
    } else {
        return [new Error('key is invalid')];
    }
};

/**
 * Sets settings values based off of their corresponding JSON
 * @param {object} json - The settings object as JSON
 * @returns {Array}
 */
SettingsService.prototype.setJSON = function (json) {
    "use strict";
    var errors = [];
    if (!_.isEmpty(json)) {
        json = this.formatJSON(json);
        _.forEach(json, function (value, key) {
            var result;
            result = this.set(key, value);
            if (result && result[0]) {
                errors.push(result[0]);
            }
        }.bind(this));
        if (errors.length) {
            return [errors[0]];
        } else {
            return [null];
        }
    } else {
        return [new Error('json is invalid')];
    }
};

/**
 * Get the specified config value for key.
 * @param {string} [key] - The config key
 * @return {*} the value of the setting
 */
SettingsService.prototype.get = function (key) {
    'use strict';

    var whitelist, settings, store;
    whitelist = ['postProcessor', 'downloaders', 'notifiers', 'searchers', 'server', 'loggers', 'database'];

    settings = {};

    if (_.isEmpty(key)) {
        _.each(whitelist, function (wlKey) {
            settings[wlKey] = this._fileStore.get(wlKey);
        }.bind(this));
        if (_.isEmpty(settings)) {
            return null;
        } else {
            return settings;
        }
    } else {
        if (key.indexOf('environment') === 0) {
            store = this._memoryStore;
        } else {
            store = this._fileStore;
        }
        return store.get.apply(store, [key]);
    }
};

/**
 * Add a validator tied to a key
 * @param {string} key - The config key
 * @param {function} validator - The validation function
 * @returns {Promise} A promise of type Promise<, Error>
 */
SettingsService.prototype.addValidator = function (key, validator) {
    'use strict';
    var deferred = Q.defer();
    if (_.isEmpty(key)) {
        deferred.reject(new Error('key is empty or invalid'));
    } else if (!_.isFunction(validator)) {
        deferred.reject(new Error('validator is empty or not a function'));
    } else if (this._validations[key]) {
        deferred.reject(new Error('validator already exists for key'));
    } else {
        this._validations[key] = validator;
        deferred.resolve();
    }
    return deferred.promise;
};

/**
 * Remove a validator for a key.
 * @param {string} key - The config key for the validator
 */
SettingsService.prototype.removeValidator = function (key) {
    'use strict';
    delete this._validations[key];
};

/**
 * Format JSON to the proper nconf formatted strings.
 * @param {object} obj - JSON Object
 * @param {string} [prefix] - key prefix, used in nested objects
 * @param {object} [result] - The resulting single tier object
 * @returns {object}
 */
SettingsService.prototype.formatJSON = function (obj, prefix, result) {
    "use strict";
    var self = this;
    prefix = prefix || '';
    result = result || {};
    _.forEach(obj, function (value, key) {
        var compoundKey = prefix + key;
        if (_.isObject(value) && !_.isArray(value)) {
            self.formatJSON(value, compoundKey + ':', result);
        } else {
            result[compoundKey] = value;
        }
    });
    return result;
};

module.exports = SettingsService;