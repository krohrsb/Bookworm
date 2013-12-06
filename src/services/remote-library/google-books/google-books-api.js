/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/15/13 10:33 AM
 * @module google-books-api-service
 */

// Dependencies
var events = require('events');
var util = require('util');
var request = require('request');
var memoize = require('memoizee');
var _ = require('lodash');
var qs = require('querystring');
var async = require('async');
var Q = require('q');

// Local Dependencies
var apiDefaults = require('./google-books-api-defaults');
var logger = require('../../log').logger();

/**
 * Google Books API Service
 * @param {object} [options] - options to override service defaults
 * @constructor
 * @alias module:google-books-api-service
 */
var GoogleBooksAPIService = function (options) {
    "use strict";

    /** @type {object} **/
    this._defaults = apiDefaults;

    /** @type {object} **/
    this._settings = _.merge({}, this._defaults, options || {});

    this._paramBlacklist = ['paging', 'offset', 'limit', 'pagingQueryLimit', 'pagingQueryParallelCount'];

    /**
     * Async Request queue - Que up API requests so we can rate limit them.
     * @type {Array}
     * @private
     */
    this._requestQueue = async.queue(function (data, next) {

        request.get(data.options, function (err, response, body) {
            setTimeout(function (data, response, body) {
                if (err || (body && body.error && !_.isEmpty(body.error.errors))) {
                    this._apiCache.clear(data.key, true);
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
     * Cache for API calls based off of a key. The key is the full URL with query params.
     * @type {function}
     * @private
     */
    this._apiCache = memoize(function (key, options, next) {
        logger.trace('not cached, issuing remote request', {data: {key: key}});
        this._requestQueue.push({
            key: key,
            options: options
        }, next);
    }.bind(this), this._settings.cacheOptions);

    events.EventEmitter.call(this);

};

util.inherits(GoogleBooksAPIService, events.EventEmitter);


/**
 * Update the settings
 * @param {object} settings - new settings
 */
GoogleBooksAPIService.prototype.updateSettings = function (settings) {
    "use strict";
    this._settings = _.merge({}, this._defaults, settings || {});
};

/**
 * Query the Google Books API
 * @param {object} options - The query options (search params)
 * @returns {Promise} A promise of type Promise<Object[], Error>
 */
GoogleBooksAPIService.prototype.query = function (options) {
    "use strict";
    var requestOptions, localOptions, key;

    // ensure options exists
    localOptions = _.clone(options, true) || {};

    this._paramBlacklist.forEach(function (param) {
        delete localOptions[param];
    });

    // define request options
    requestOptions = {
        uri: this._settings.apiUrl,
        qs: _.merge({}, this._settings.queryParams, localOptions),
        headers: {
            'User-Agent': this._settings.userAgent
        },
        json: true
    };

    // create the key used for caching lookup
    key = requestOptions.uri + '?' + qs.stringify(requestOptions.qs);
    logger.trace('making request to cache', requestOptions.qs);
    // call the cache (will request if not in cache, otherwise will return the cached result)
    return Q.ninvoke(this, '_apiCache', key, requestOptions);

};

/**
 * Paging Query - query the Google Books API in an automated paging fashion.
 * @param {object} options - paging query options, contains regular query options. Also supports pagingQueryLimit and pagingQueryParallelCount.
 * @returns {Promise} A promise of type Promise<Object[], Error>
 */
GoogleBooksAPIService.prototype.pagingQuery = function (options) {
    "use strict";
    var queue, results, deferred;
    deferred = Q.defer();
    options.startIndex = parseInt(options.startIndex, 10);
    options.maxResults = parseInt(options.maxResults, 10);
    options.paging = {
        count: 0,
        pagingQueryParallelCount: parseInt(options.pagingQueryParallelCount, 10),
        pagingQueryLimit: parseInt(options.pagingQueryLimit, 10)
    };

    // set up some defaults just in case (as we use these for calculations in paging
    if (_.isNaN(options.startIndex)) {
        options.startIndex = 0;
    }
    if (_.isNaN(options.maxResults)) {
        options.maxResults = 40;
    }
    // allow passing in of rate control parameters, set the defaults
    if (_.isNaN(options.paging.pagingQueryParallelCount)) {
        options.paging.pagingQueryParallelCount = this._settings.pagingQueryParallelCount;
    }
    if (_.isNaN(options.paging.pagingQueryLimit)) {
        options.paging.pagingQueryLimit = this._settings.pagingQueryLimit;
    }



    results = [];

    // set up the queue
    queue = async.queue(function (query, next) {
        // the queue action is to run the api query
        this.query(query).then(function (body) {

            query.paging.count = query.paging.count + 1;
            // conditions to allow another query to be queued up:
            // 1. previous response existed
            // 2. previous response had positive total items
            // 3. previous response had items array returned
            // 4. paging query limit is less than 0 (limitless, other than the above critera) or query has not exceeded the paging query limit
            if (body && body.totalItems && body.items && (query.paging.pagingQueryLimit < 0 || query.paging.count < query.paging.pagingQueryLimit)) {
                query.startIndex = query.startIndex + query.maxResults;
                queue.push(query);
            }
            // push the result to the results array
            results.push(body);
            // fire the callback
            next();
        }, next);
    }.bind(this), options.paging.pagingQueryParallelCount);

    /**
     * Handle when the queue is drained (all workers have returned their results)
     */
    queue.drain = function () {
        // call the pagingQuery callback with a flattened result set
        deferred.resolve(_.flatten(results));
    };

    // push the 1st query to the queue
    queue.push(options);

    return deferred.promise;
};

/**
 * Find a Google Books volume given its id
 * @param {string} id - The volume identifier
 * @param {object} options - The query options (search params)
 * @returns {Promise} A promise of type Promise<Object, Error>
 */
GoogleBooksAPIService.prototype.findById = function (id, options) {
    "use strict";
    var requestOptions, key;

    // ensure options exist
    options = options || {};

    // define request options
    requestOptions = {
        uri: this._settings.apiUrl + '/' + id,
        qs: _.merge({}, this._settings.queryParams, options),
        headers: {
            'User-Agent': this._settings.userAgent
        },
        json: true
    };

    // create the key used for caching lookup
    key = requestOptions.uri + '?' + qs.stringify(requestOptions.qs);

    // call the cache (will request if not in cache, otherwise will return the cached result)
    return Q.ninvoke(this, '_apiCache', key, requestOptions);

};


module.exports = GoogleBooksAPIService;