/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/21/13 2:27 PM
 */

// Dependencies
var events = require('events');
var util = require('util');
var _ = require('lodash');
var Q = require('q');

var SABnzbdAPI = require('sabnzbd');
var logger = require('../../log');
/**
 * SABnzbd Service
 * @param {object} options - sab options
 * @constructor
 */
var SabnzbdService = function (options) {
    "use strict";
    events.EventEmitter.call(this);
    this._defaults = {
        category: 'default'
    };

    this._settings = _.merge({}, this._defaults, options || {});

    this._api = null;

    this._initializeApi();

};

util.inherits(SabnzbdService, events.EventEmitter);

/**
 * Initialize the API
 * @private
 */
SabnzbdService.prototype._initializeApi = function () {
    "use strict";
    if (this._settings.host && this._settings.apiKey) {
        this._api = new SABnzbdAPI((this._settings.host.indexOf('http') === 0) ? this._settings.host : 'http://' + this._settings.host, this._settings.apiKey);
    } else {
        logger.log('warn', 'SABnzbd host and/or apiKey not specified');
    }

};

/**
 * Update Settings
 * @param {object} options - sab options
 */
SabnzbdService.prototype.updateSettings = function (options) {
    "use strict";
    this._settings = _.merge({}, this._defaults, options || {});
    this._initializeApi();
};

/**
 * Add a nzb to the service
 * @param {string} url - The NZB url
 * @param {string} category - The NZB category
 * @param {string} name - The NZB name
 * @returns {Promise} A promise of type Promise<Object, Error>
 */
SabnzbdService.prototype.add = function (url, category, name) {
    "use strict";
    if (this._api) {
        return this._api.cmd('addurl', {
            name: url,
            cat: category || this._settings.category,
            nzbname: name
        })
        .then(function (response) {
            if (response.status === false) {
                throw new Error('Error adding to sabnzbd');
            } else {
                this.emit('add', url, category, name);
                return response;
            }
        }.bind(this));
    } else {
        return Q.fcall(function () {
            throw new Error('SABnzbd API not initialized, please check the settings.');
        });
    }

};

module.exports = SabnzbdService;