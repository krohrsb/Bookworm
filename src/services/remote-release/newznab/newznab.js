/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/18/13 3:39 PM
 */

// Dependencies
var events = require('events');
var util = require('util');
var Q = require('q');
var _ = require('lodash');

// Local Dependencies

var Release = require('../../../models/release');
var NewznabAPIService = require('./newznab-api');
var NewznabParser = require('./newznab-parser');

/**
 * Newznab Service - Query one or more newznab hosts for releases.
 * @param {object} options - service options
 * @param {object} apiOptions - service api options
 * @constructor
 */
var NewznabService = function (options, apiOptions) {
    "use strict";

    /** @type {object} **/
    this._defaults = {
        providers: []
    };

    /** @type {object} **/
    this._settings = _.merge({}, this._defaults, options || {});

    this._api = new NewznabAPIService(apiOptions);

    this._parser = new NewznabParser();

    events.EventEmitter.call(this);
};

util.inherits(NewznabService, events.EventEmitter);

/**
 * Update the settings
 * @param {object} settings - new settings
 */
NewznabService.prototype.updateSettings = function (settings) {
    "use strict";
    this._settings = _.merge({}, this._defaults, settings || {});
};

/**
 * Update the API settings
 * @param {object} settings - new settings
 */
NewznabService.prototype.updateAPISettings = function (settings) {
    "use strict";
    this._api.updateSettings(settings);
};

/**
 * Sort results
 * @param {object} options - query options
 * @param {object[]} releases - releases to sort
 * @returns {Promise} A promise of type Promise<Releases[], Error>
 * @private
 */
NewznabService.prototype._sort = function (options, releases) {
    "use strict";
    return Q.fcall(function () {
        var sorted = _.sortBy(releases, function (release) {
            if (typeof release[options.sort] !== 'undefined') {
                return release[options.sort];
            } else {
                return release.usenetDate;
            }
        });
        if (options.direction && options.direction.toLowerCase() === 'desc') {
            sorted = sorted.reverse();
        }
        return sorted;
    });
};

/**
 * Query all enabled newznab providers.
 * @param {object} options - The query options
 * @returns {Promise} A promise of type Promise<Array, Error>
 */
NewznabService.prototype.query = function (options) {
    "use strict";
    var settings = _.clone(this._settings, true);

    return Q.all(settings.providers.map(function (provider) {
        var localOptions;
        if (provider.enabled) {
            localOptions = _.clone(options, true);
            localOptions.apikey = provider.apiKey;
            return this._query(provider.host, localOptions);
        } else {
            return [];
        }
    }.bind(this))).then(function (resultSets) {
        var results = _.flatten(resultSets);
        return _.uniq(results, false, function (item) {
            return item.title;
        });
    }).then(_.partial(this._sort, options).bind(this));
};

/**
 * Query a single newznab api url with options.
 * @param {string} url - The newznab API url
 * @param {object} options - The query options, including apikey.
 * @returns {Promise} A promise of type Promise<Array, Error>
 * @private
 */
NewznabService.prototype._query = function (url, options) {
    "use strict";
    return this._api.query(url, options)
        .then(this._parser.parseResponse.bind(this._parser))
        .then(function (items) {
            return Q.all(items.map(this.constructRelease.bind(this)));
        }.bind(this))
        .then(function (releases) {
            return _.filter(releases, function (release) {
                return _.isObject(release);
            });
        }.bind(this));
};

/**
 * Construct a release object
 * @param {object} release - The release data gathered from a newznab source.
 * @returns {Promise} A promise of type Promise<Object, Error>
 */
NewznabService.prototype.constructRelease = function (release) {
    "use strict";
    var attributes, guid, usenetDate, deferred, size, grabs, review;
    deferred = Q.defer();

    if (release) {
        attributes = _.pluck(release.attr, '@attributes');

        usenetDate = _.find(attributes, function (attr) {
            return attr.name === 'usenetdate';
        }).value;

        size = _.find(attributes, function (attr) {
            return attr.name === 'size';
        }).value;

        guid = _.find(attributes, function (attr) {
            return attr.name === 'guid';
        }).value;

        grabs = _.find(attributes, function (attr) {
            return attr.name === 'grabs';
        }).value;

        review = _.find(attributes, function (attr) {
            return attr.name === 'review';
        }).value;

        deferred.resolve({
            title: release.title,
            nzbTitle: release.title + '.bw(' + guid + ')',
            description: release.description,
            grabs: grabs,
            review: review,
            providerName: release.channelTitle,
            providerType: 'newznab',
            usenetDate: usenetDate,
            size: size,
            link: release.link,
            status: 'available',
            guid: guid,
            updated: Date.now()
        });
    } else {
        deferred.resolve();
    }

    return deferred.promise;
};

module.exports = NewznabService;