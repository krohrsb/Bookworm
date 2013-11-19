/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/22/13 2:54 PM
 */
// Dependencies
var events = require('events');
var util = require('util');
var _ = require('lodash');
var Q = require('q');
var moment = require('moment');
var fs = require('fs-extra');
var path = require('path');

// Local Dependencies
var logger = require('../log').logger();
var releaseService = require('../library/release');
var bookService = require('../library/book');

/**
 * Post Process Service
 * Processes the download directory for releases and moves them to the configured location.
 * @param {object} [options] - Options object for configuration.
 * @constructor
 */
var PostProcessService = function (options) {
    "use strict";

    events.EventEmitter.call(this);
    this._defaults = {};
    this._safePathRegex = '[^ 0-9a-zA-Z-[]()_\/]';
    this._settings = _.merge({}, this._defaults, options || {});

};

util.inherits(PostProcessService, events.EventEmitter);

/**
 * Update the instance settings
 * @param {object} options - Updated options object
 */
PostProcessService.prototype.updateSettings = function (options) {
    "use strict";
    logger.debug('PostProcessService::updateSettings - updating settings');
    this._settings = _.merge({}, this._defaults, options || {});
};

/**
 * Retrieve a list of directories that are in the download directory
 * @returns {Promise} A promise of type Promise<String[], Error>
 */
PostProcessService.prototype.getDirectories = function () {
    "use strict";
    return Q.ninvoke(fs, 'readdir', this._settings.downloadDirectory).then(function (files) {
        return Q.all(files.map(function (file) {
            return Q.ninvoke(fs, 'stat', path.join(this._settings.downloadDirectory, file)).then(function (stat) {
                return {
                    isDirectory: stat.isDirectory(),
                    file: path.join(this._settings.downloadDirectory, file)
                };
            }.bind(this));
        }.bind(this)));
    }.bind(this)).then(function (files) {
        return _.pluck(_.filter(files, function (file) {
            return file.isDirectory;
        }), 'file');
    });

};

/**
 * Retrieve a release for the given directory, if any.
 * @param {string} directory - The directory to check for a release
 * @returns {Promise} A promise of type Promise<Release, Error>
 */
PostProcessService.prototype.getDirectoryRelease = function (directory) {
    "use strict";

    return Q.fcall(function () {
        var guid, results, regex;
        guid = null;
        regex = /\.bw\(([A-Za-z0-9\-]+)\)$/g;

        results = regex.exec(directory);

        if (results && results[1]) {
            guid = results[1];
        }
        return guid;
    }).then(function (guid) {
        if (guid) {
            return releaseService.findOne({
                where: {
                    guid: guid
                }
            }).then(function (release) {
                if (release) {
                    release.directory = directory;
                }
                return release;
            });
        } else {
            return null;
        }
    });
};

/**
 * Resolves a path containing a pattern for folder name generation.
 * @param {string} pattern - the pattern string e.g., $First/$Author/$Title
 * @param {string} author - The author name
 * @param {string} title - The book title
 * @param {Date} date - The book published date
 * @returns {null}
 */
PostProcessService.prototype.resolvePatternPath = function (pattern, author, title, date) {
    "use strict";
    var replacers, firstLetter, path;

    path = pattern;

    firstLetter = author.slice(0, 1);

    replacers = {
        '$First': firstLetter.toUpperCase(),
        '$first': firstLetter.toLowerCase(),
        '$Author': author,
        '$author': author.toLowerCase(),
        '$Title': title,
        '$title': title.toLowerCase(),
        '$Year': moment(date).format('YYYY')
    };

    _.forEach(replacers, function (value, key) {
        path = path.replace(key, value);
    });

    //noinspection JSHint
    return ((_.isEmpty(path)) ? null : path.replace(new RegExp(this._safePathRegex, 'g'), ''));
};

/**
 * Move a release from the download directory to the configured destination.
 * @param {object} release - The release object
 * @param {object} book - The book that goes with the release
 * @returns {Promise} A promise of type Promise<Release, Error>
 */
PostProcessService.prototype.moveRelease = function (release, book) {
    "use strict";
    var folderName, destinationDirectory, sourceDirectory, existsDeferred;

    existsDeferred = Q.defer();

    sourceDirectory = release.directory;

    folderName = this.resolvePatternPath(this._settings.folderFormat, book.authorName, book.title, book.published);

    destinationDirectory = path.join(this._settings.destinationDirectory, folderName);

    logger.info('Moving release %s to destination directory %s', release.title, destinationDirectory);

    fs.exists(sourceDirectory, existsDeferred.resolve);

    return existsDeferred.promise.then(function (exists) {
        if (exists) {
            logger.debug('Creating destination directory %s', destinationDirectory);
            return Q.ninvoke(fs, 'mkdirs', destinationDirectory, this._settings.directoryPermissions).then(function () {
                logger.debug('Copying directory from %s to %s', sourceDirectory, destinationDirectory);
                return Q.ninvoke(fs, 'copy', sourceDirectory, destinationDirectory).then(function () {
                    if (this._settings.keepOriginalFiles) {
                        return null;
                    } else {
                        logger.debug('Removing original release directory %s', sourceDirectory);
                        return Q.ninvoke(fs, 'remove', sourceDirectory);
                    }
                }.bind(this)).then(function () {
                    release.directory = destinationDirectory;
                    return release;
                });
            }.bind(this));
        } else {
            throw new Error('Directory %s for release no longer exists', sourceDirectory);
        }
    }.bind(this));
};

/**
 * Write an OPF XML file to the specified directory using data from book.
 * @param {object} book - The book object
 * @param {string} destinationDirectory - the full path to the directory to output the opf file.
 * @returns {Promise} A promise of type Promise<Undefined, Error>
 */
PostProcessService.prototype.writeOpf = function (book, destinationDirectory) {
    "use strict";
    if (book) {
        return bookService.getOpf(book).then(function (opf) {
            return Q.ninvoke(fs, 'outputFile', path.join(destinationDirectory, this._settings.opfName), opf);
        }.bind(this));
    } else {
        return Q.fcall(function () {
            throw new Error('No book to write opf from');
        });
    }
};

/**
 * Process a single release
 * @param {object} release - The release object
 * @returns {Promise} A promise of type Promise<Release, Error>
 */
PostProcessService.prototype.processRelease = function (release) {
    "use strict";
    if (release) {
        logger.info('Processing release %s', release.title);
        return Q.ninvoke(release, 'getBook').then(function (book) {
            if (book && book.status === 'snatched') {
                return this.moveRelease(release, book).then(function (release) {
                    book.status = 'downloaded';
                    release.status = 'downloaded';
                    book.updated = Date.now();
                    release.updated = Date.now();
                    return Q.all([Q.ninvoke(book, 'save'), Q.ninvoke(release, 'save')]).spread(function (book, release) {
                        logger.info('Finished processing %s', book.title);
                        this.emit('processed', book, release);
                        return this.writeOpf(book, release.directory).then(function () {
                            return release;
                        });
                    }.bind(this));
                }.bind(this));
            } else {
                return release;
            }
        }.bind(this));
    } else {
        return Q.fcall(function () {
            throw new Error('No release to process');
        });
    }
};

/**
 * Process the download directory
 * @returns {Promise} A promise of type Promise<Release[], Error>
 */
PostProcessService.prototype.process = function () {
    "use strict";
    logger.info('Initiating Post Processor');
    return this.getDirectories().then(function (directories) {
        return Q.all(directories.map(this.getDirectoryRelease)).then(function (releases) {
            return _.compact(releases);
        }).then(function (releases) {
            return Q.all(releases.map(this.processRelease.bind(this)));
        }.bind(this));
    }.bind(this)).then(function (releases) {
        logger.info('Post Processor finished. Processed %s releases', releases.length);
        return releases;
    }).fail(function (err) {
        logger.err(err);
        throw err;
    });
};

module.exports = PostProcessService;