/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/18/13 3:45 PM
 */

// Dependencies
var events = require('events');
var util = require('util');
var async = require('async');
var Q = require('q');
var qs = require('querystring');
var _ = require('lodash');
var memoize = require('memoizee');
var request = require('request');

// Local Dependencies
var logger = require('../../log/');
var apiDefaults = require('./newznab-api-defaults');

/**
 * Newznab API Service
 * @param {object} options - api options
 * @constructor
 */
var NewznabAPIService = function (options) {
    "use strict";
    //TODO: Remove or make configurable, only needed right now as api.nzb.su is reporting as nzb.su
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
    /** @type {object} **/
    this._defaults = apiDefaults;

    /** @type {object} **/
    this._settings = _.merge({}, this._defaults, options || {});

    this._paramBlacklist = [];

    /**
     * Async Request queue - Que up API requests so we can rate limit them.
     * @type {Array}
     * @private
     */
    this._requestQueue = async.queue(function (data, next) {
        logger.log('debug', 'Not cached, issuing remote request', data.options.qs);
        request.get(data.options, function (err, response, body) {
            setTimeout(function (data, response, body) {
                if (err || (body && body.error && !_.isEmpty(body.error.errors))) {
                    this._apiCache.clear(data.id, true);
                }
                if (err) {
                    next(err);
                } else {
                    next(null, body);
                }
            }.bind(this), this._settings.requestQueueDelay, data, response, body);
        }.bind(this));

    }.bind(this), this._settings.requestQueueParallelCount);

    /**
     * Cache for API calls based off of a id. The id is the full URL with query params.
     * @type {function}
     * @private
     */
    this._apiCache = memoize(function (id, options, next) {
        this._requestQueue.push({
            id: id,
            options: options
        }, next);
    }.bind(this), this._settings.cacheOptions);

    events.EventEmitter.call(this);
};

util.inherits(NewznabAPIService, events.EventEmitter);

/**
 * Update the settings
 * @param {object} settings - new settings
 */
NewznabAPIService.prototype.updateSettings = function (settings) {
    "use strict";
    this._settings = _.merge({}, this._defaults, settings || {});
};

/**
 * Query the newznab API
 * @param {string} url - api url
 * @param {object} options - api options
 * @returns {Promise} A promise of type Promise<Array, Error>
 */
NewznabAPIService.prototype.query = function (url, options) {
    "use strict";
    var requestOptions, localOptions, id;

    // ensure options exists
    localOptions = _.clone(options, true) || {};

    this._paramBlacklist.forEach(function (param) {
        delete localOptions[param];
    });

    if (!url.match(/\/api$/)) {
        url = url + '/api';
    }
    // define request options
    requestOptions = {
        uri: url,
        qs: _.merge({}, this._settings.queryParams, localOptions),
        headers: {
            'User-Agent': this._settings.userAgent
        },
        json: true
    };

    // create the id used for caching lookup
    id = requestOptions.uri + '?' + qs.stringify(requestOptions.qs);
    logger.log('debug', 'Making request to cache', requestOptions.qs);
    // call the cache (will request if not in cache, otherwise will return the cached result)
    return Q.ninvoke(this, '_apiCache', id, requestOptions);
};

module.exports = NewznabAPIService;