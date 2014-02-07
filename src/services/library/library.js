/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/18/13 11:35 AM
 */

// Dependencies
var events = require('events');
var util = require('util');
var Q = require('q');
var _ = require('lodash');

// Local Dependencies
var db = require('../../config/models');
var sabnzbd = require('../download/sabnzbd');
var settingService = require('../setting');
var remoteLibraryService = require('../remote-library');
var remoteReleaseService = require('../remote-release');
var logger = require('../log').logger();

/**
 * Library Service - handles operations that span multiple library components such as author, book, release, downloading etc.
 * @constructor
 */
var LibraryService = function () {
    "use strict";
    events.EventEmitter.call(this);
};

util.inherits(LibraryService, events.EventEmitter);


/**
 * Retrieve a release for a book.
 * @param {Book} book - Book object
 * @returns {Promise} A promise of type Promise<Release, Error>
 */
LibraryService.prototype.findAndWantRelease = function (book) {
    "use strict";
    logger.log('info', 'Retrieving release for book', {title: book.title});
    /**
     * Steps:
     * 1. Get local book releases
     * 2. Sort releases by updated date
     * 3. Find the first release that are snatched or downloaded
     * 4. If book is wanted, return that first release
     * 5. If book is wanted_new then query remote release service for releaes for the book
     * 6. Filter out books in local releases from the remote release returns
     * 7. Return the first release out of that filtered group.
     */
    return Q.fcall(function () {
        if (!book.isWanted()) {
            throw new Error('Attempted to retrieve a release for a non wanted book');
        }
    }).then(function () {
        return book.getReleases();
    }).then(function (releases) {
        return _.sortBy(releases,function (release) {
            return release.updatedAt;
        }).reverse();
    }).then(function (releases) {
        var retryRelease = null, availableRelease;

        if (book.status === 'wanted') {
            retryRelease = _.find(releases, function (release) {
                return ['snatched', 'wanted', 'downloaded'].indexOf(release.status) !== -1;
            });
        }
        availableRelease = _.find(releases, function (release) {
            return release.status === 'available';
        });

        if (retryRelease) {
            logger.log('info', 'Retrying previous release', {release: retryRelease.title});
            return retryRelease;
        } else if (availableRelease) {
            logger.log('info', 'Trying stored available release', {release: availableRelease.title});
            return availableRelease;
        } else {
            logger.log('info', 'Searching for new release in cloud for book', {title: book.title});
            return remoteReleaseService.query({
                title: book.title,
                author: book.authorName
            }).then(function (remoteReleases) {
                return _.reject(remoteReleases, function (remoteRelease) {
                    return _.find(releases, function (release) {
                        return release.guid === remoteRelease.guid;
                    });
                });
            }).then(function (remoteReleases) {
                remoteReleases = remoteReleases || [];
                return Q.all(remoteReleases.map(function (release) {
                    return db.Release.findOrCreate({
                        guid: release.guid
                    }, release).then(function (release) {
                        return release.setBook(book);
                    });
                }));
            }).then(function (releases) {
                var release;
                release = _.first(releases);
                if (releases && releases.length) {
                    logger.log('info', 'Found multiple releases for book, trying first', {releases: releases.length, book: book.title, release: release.title});
                } else {
                    logger.log('info', 'No releases found for book', {title: book.title});
                }
                return release;
            });
        }
    }).then(function (release) {
        if (release) {
            return release.updateAttributes({status: 'wanted'});
        } else {
            return null;
        }
    });

};


/**
 * Download a release for a book
 * @param {object} book - Book object
 * @param {object} release - Release object
 * @returns {Promise} A promise of type Promise<Release, Error>
 */
LibraryService.prototype.downloadRelease = function (book, release) {
    "use strict";

    if (release) {
        return sabnzbd.add(release.link, null, release.nzbTitle).then(function () {
            return Q.all([book.updateAttributes({status: 'snatched'}), release.updateAttributes({status: 'snatched'}), release.setBook(book)]).spread(function (book, release) {
                return release;
            });
        });
    } else {
        return null;
    }

};

/**
 * Refresh an author by gathering remote data
 * @param {object} author - The author to refresh
 * @param {object} [options] - options object
 * @returns {Promise} A promise of type Promise<Author, Error>
 */
LibraryService.prototype.refreshAuthor = function (author, options) {
    "use strict";
    var limit;

    options = options || {};
    options.onlyNewBooks = (typeof options.onlyNewBooks === 'string' && options.onlyNewBooks === 'true') || (typeof options.onlyNewBooks === 'boolean' && options.onlyNewBooks);
    if (options.pagingQueryLimit) {
        limit = options.pagingQueryLimit;
    } else {
        limit = (options.onlyNewBooks) ? settingService.get('searchers:googleBooks:pagingLimits:searchNewBooks') : settingService.get('searchers:googleBooks:pagingLimits:refreshAuthor');
    }
    logger.log('info', 'Refreshing author', {author: author.name});
    return remoteLibraryService.pagingQuery({
        q: 'inauthor:' + author.name,
        pagingQueryLimit: limit,
        orderBy: (options.onlyNewBooks) ? 'newest' : 'relevance'
    }).then(function (remoteBooks) {
            return Q.fcall(function () {
                if (!options.onlyNewBooks) {
                    return remoteLibraryService.pagingQuery({
                        q: 'inauthor:' + author.name,
                        pagingQueryLimit: settingService.get('searchers:googleBooks:pagingLimits:searchNewBooks'),
                        orderBy: 'newest'
                    });
                } else {
                    return [];
                }
            }).then(function (newBooks) {
                return author.getBooks().then(function (books) {
                    return db.Book.merge(author, books, remoteBooks, !options.onlyNewBooks).then(function (books) {
                        if (newBooks.length) {
                            return db.Book.merge(author, books, newBooks, !options.onlyNewBooks);
                        } else {
                            return Q(books);
                        }
                    });
                });
            });
    }).then(function (books) {
        author.books = books;
        logger.log('info', 'Finished refreshing author', {author: author.name});
        return author;
    }.bind(this));
};

/**
 * Refresh all active authors - grabbing their new books.
 * @param {boolean} [onlyNewBooks] - only search for new books?
 * @returns {Promise} A promise of type Promise<Author[], Error>
 */
LibraryService.prototype.refreshActiveAuthors = function (onlyNewBooks) {
    "use strict";
    logger.log('info', 'Refreshing all active authors', {onlyNewBooks: onlyNewBooks});
    return db.Author.all({
        where: {
            status: 'active'
        }
    }).then(function (authors) {
        return Q.all(authors.map(function (author) {
            return this.refreshAuthor(author, {
                onlyNewBooks: onlyNewBooks
            });
        }.bind(this)));
    }.bind(this));
};

/**
 * Find and download wanted books for all active authors.
 * @returns {Promise} A promise of type Promise<Object[], Error>
 */
LibraryService.prototype.findAndDownloadWantedBooks = function () {
    "use strict";
    logger.log('info', 'Searching for all wanted books for active authors');

    return db.Author.all({
        where: {
            status: 'active'
        },
        include: [db.Book]
    }).then(function (authors) {
        if (_.isArray(authors)) {
            return Q.all(authors.map(function (author) {
                var wantedBooks;
                wantedBooks = _.filter(author.books, function (book) {
                    return book.isWanted();
                });
                logger.log('info', 'Found', wantedBooks.length, 'wanted books');
                return Q.all(wantedBooks.map(function (book) {
                    return this.findAndWantRelease(book);
                }.bind(this)));
            }.bind(this)));
        } else {
            return [];
        }
    }.bind(this));
};

module.exports = LibraryService;