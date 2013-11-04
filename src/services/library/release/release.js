/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/21/13 4:03 PM
 */

// Dependencies
var events = require('events');
var util = require('util');
var _ = require('lodash');
var Q = require('q');
var mask = require('json-mask');

// Local Dependencies
var Release = require('../../../models/release');

/**
 * Release Service
 * @constructor
 */
var ReleaseService = function () {
    "use strict";
    this._validUpdateAttributesMask = 'status';
    events.EventEmitter.call(this);
};

util.inherits(ReleaseService, events.EventEmitter);

/**
 * Find a release given their ID
 * @param {Number} id - The ID of the release
 * @param {object} options - Find options, supports expand.
 * @returns {Promise} A promise of type Promise<Release|null, Error>
 */
ReleaseService.prototype.find = function (id, options) {
    "use strict";
    options = options || {};
    return Q.ninvoke(Release, 'find', id).then(_.partial(this.expandRelease, options.expand).bind(this));

};

/**
 * Expand an release's books. Load the release's books into their books property.
 * @param {object} release - The release object
 * @returns {Promise} A promise of type Promise<Release, Error>
 */
ReleaseService.prototype.expandReleaseBook = function (release) {
    "use strict";

    if (release) {
        return Q.ninvoke(release, 'getBook').then(function (book) {
            release.book = book;
            return release;
        });
    } else {
        return Q.fcall(function () {
            throw new Error('No release provided');
        });
    }
};

/**
 * Expand an release using an expands string to determine what to expand.
 * @param {string} expands - Comma delimited string of expand properties. e.g., books,latestBook
 * @param {object} release - The release object
 * @returns {Promise} A promise of type Promise<Release, Error>
 */
ReleaseService.prototype.expandRelease = function (expands, release) {
    "use strict";
    if (expands) {

        return Q.fcall(function () {
                if (_.contains(expands, 'books')) {
                    return this.expandReleaseBook(release);
                } else {
                    return release;
                }
            }.bind(this));

    } else {
        //noinspection JSHint
        return Q(release);
    }
};

/**
 * Expand multiple releases
 * @param {string} expands - Comma delimited string of expand properties. e.g., books,latestBook
 * @param {object[]} releases - An array of release objects
 * @returns {Promise} A promise of type Promise<Release[], Error>
 */
ReleaseService.prototype.expandReleases = function (expands, releases) {
    "use strict";
    return Q.all((releases || []).map(_.partial(this.expandRelease, expands).bind(this)));
};

/**
 * Retrieve all releases given the search critera in the 'where' object.
 * @param {object} where - search criteria, can be empty.
 * @param {object} [options] - search options, such as expands
 * @returns {Promise} A promise of type Promise<Release[], Error>
 */
ReleaseService.prototype.all = function (where, options) {
    "use strict";
    where = where || {};
    options = options || {};
    return Q.ninvoke(Release, 'all', where).then(_.partial(this.expandReleases, options.expand).bind(this));
};

/**
 * Counts instances given criteria
 * @param {object} where - search criteria, can be empty.
 * @returns {Promise} A promise of type Promise<Number, Error>
 */
ReleaseService.prototype.count = function (where) {
    "use strict";
    return Q.ninvoke(Release, 'count', where);
};

/**
 * Retrieve the first release given the search critera in the 'where' object.
 * @param {object} where - search criteria, can be empty.
 * @param {object} [options] - search options, such as expands
 * @returns {Promise} A promise of type Promise<Release, Error>
 */
ReleaseService.prototype.findOne = function (where, options) {
    "use strict";
    where = where || {};
    options = options || {};
    return Q.ninvoke(Release, 'findOne', where).then(_.partial(this.expandRelease, options.expand).bind(this));
};

/**
 * Find a book given a release id
 * @param {Number} id - The ID of the book
 * @returns {Promise} A promise of type Promise<Author|null, Error>
 */
ReleaseService.prototype.findBook = function (id) {
    "use strict";
    return Q.ninvoke(Release, 'find', id).then(function (book) {
        if (book) {
            return Q.ninvoke(book, 'getBook');
        } else {
            return null;
        }
    });
};

/**
 * Create an release. If the release already exists, return the existing.
 * @param {object} data - Release data
 * @returns {Promise} A promise of type Promise<Release, Error>
 */
ReleaseService.prototype.create = function (data) {
    "use strict";
    return Q.ninvoke(Release, 'create', data).then(function (release) {
        this.emit('create', release);
        return release;
    }.bind(this));
};

/**
 * Update an release given its ID and some data to update.
 * @param {Number} id - The ID of the release
 * @param {object} data - An object containing data to update
 * @param {object} options - options for the update, such as expand.
 * @returns {Promise} A promise of type Promise<Release, Error>
 */
ReleaseService.prototype.updateById = function (id, data, options) {
    "use strict";
    options = options || {};
    if (id) {
        return this.find(id, {})
            .then(function (release) {
                if (release) {
                    return this.update(release, data);
                } else {
                    return null;
                }
            }.bind(this))
            .then(_.partial(this.expandRelease, options.expand).bind(this));
    } else {
        return Q.fcall(function () {
            var err = new Error('ID property not specified');
            err.statusCode = 400;
            throw err;
        });
    }

};

/**
 * Update an release given the release object and data to update.
 * *NOTE* only allowed attributes will be updated. See _validUpdateAttributesMask
 * @param {object} release - The release object
 * @param {object} data - An object containing data to update
 * @returns {Promise} A promise of type Promise<Release, Error>
 */
ReleaseService.prototype.update = function (release, data) {
    "use strict";
    return Q.ninvoke(release, 'updateAttributes', mask(data, this._validUpdateAttributesMask)).then(function (release) {
        this.emit('update', release, _.intersection(_.keys(release.toJSON()), _.keys(data)));
        return release;
    }.bind(this));
};

/**
 * Updates multiple books given their data (provided they have an ID)
 * @param {object[]|object} releasesData - Array of release data or singular release data.
 * @param {object} [options] - options for the update, such as expand.
 * @returns {Promise} A promise of type Promise<Release[], Error>
 */
ReleaseService.prototype.updateAll = function (releasesData, options) {
    "use strict";
    options = options || {};
    if (!_.isArray(releasesData)) {
        releasesData = [releasesData];
    }
    return Q.all(releasesData.map(function (releaseData) {
        return this.updateById(releaseData.id, releaseData, options);
    }.bind(this)));
};


/**
 * Remove an release given their id - DOES NOT REMOVE THEIR BOOKS
 * @param {Number} id - The book id
 * @returns {Promise} A promise of type Promise<, Error>
 */
ReleaseService.prototype.removeById = function (id) {
    "use strict";
    return this.find(id, {}).then(function (release) {
        var error;
        if (release) {
            return Q.ninvoke(release, 'destroy').then(function () {
                this.emit('remove', id);
            }.bind(this));
        } else {
            error = new Error('Release does not exist');
            error.statusCode = 404;
            throw error;
        }
    }.bind(this));
};

/**
 * Remove one or more releases given an array of release data - DOES NOT REMOVE THEIR BOOKS
 * @param {object|object[]} releasesData - The book data
 * @returns {Promise} A promise of type Promise<, Error>
 */
ReleaseService.prototype.remove = function (releasesData) {
    "use strict";
    if (_.isUndefined(releasesData)) {
        releasesData = [];
    }

    if (!_.isArray(releasesData)) {
        releasesData = [releasesData];
    }
    return Q.all(releasesData.map(function (releaseData) {
        return this.removeById(releaseData.id);
    }.bind(this)));
};

/**
 * Clear any currently wanted releases, making them ignored.
 * @returns {Promise} A promise of type Promise<Release[], Error>
 */
ReleaseService.prototype.clearWanted = function () {
    "use strict";
    return this.all({
        where: {
            status: 'wanted'
        }
    }).then(function (releases) {
        releases.forEach(function (release) {
            release.status = 'ignored';
        });
        return this.updateAll(releases);
    }.bind(this));
};

module.exports = ReleaseService;