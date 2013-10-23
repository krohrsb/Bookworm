/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/18/13 11:35 AM
 */

// Dependencies
var events = require('events');
var util = require('util');
var Q = require('q');
var uuid = require('node-uuid');
var _ = require('lodash');

// Local Dependencies
var authorService = require('./author');
var bookService = require('./book');
var releaseService = require('./release');
var sabnzbd = require('../download/sabnzbd');
var remoteReleaseService = require('../remote-release');
var remoteLibraryService = require('../remote-library');
var settingService = require('../setting');
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
 * Find and download a release for the book
 * @param {Book} book - Book object
 * @returns {Promise} A promise of type Promise<Release, Error>
 */
LibraryService.prototype.findAndDownloadRelease = function (book) {
    "use strict";
    return this.getRelease(book).then(_.partial(this.downloadRelease, book).bind(this));
};

/**
 * Retrieve a release for a book.
 * @param {Book} book - Book object
 * @returns {Promise} A promise of type Promise<Release, Error>
 */
LibraryService.prototype.getRelease = function (book) {
    "use strict";
    logger.info('Retrieving release for book %s', book.title);
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
        return Q.ninvoke(book, 'getReleases');
    }).then(function (releases) {
        return _.sortBy(releases, function (release) {
            return release.updated;
        }).reverse();
    }).then(function (releases) {
        return Q.fcall(function () {
            return _.find(releases, function (release) {
                return release.status === 'snatched' || release.status === 'downloaded' || release.status === 'wanted';
            });
        }).then(function (release) {
            if (book.status === 'wanted' && release) {
                logger.info('Retrying existing release %s', release.title);
                return release;
            } else if (book.status === 'wanted_new' || !release) {
                logger.info('Searching for new release');
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
                    return _.first(remoteReleases);
                }).then(function (release) {
                    if (release) {
                        release.bookId = book.id;
                        release.status = 'wanted';
                        return releaseService.create(release);
                    } else {
                        return null;
                    }

                });
            } else {
                throw new Error('Attempting to retrieve a release for a non wanted book');
            }
        });
    });
};

/**
 * Download a release for a book
 * @param {Book} book - Book object
 * @param {Release} release - Relesae object
 * @returns {Promise} A promise of type Promise<Release, Error>
 */
LibraryService.prototype.downloadRelease = function (book, release) {
    "use strict";
    if (release) {
        return sabnzbd.add(release.link, null, release.nzbTitle).then(function () {
            release.status = 'snatched';
            book.status = 'snatched';
            book.updated = Date.now();
            release.updated = Date.now();
            release.bookId = book.id;
            return Q.all([Q.ninvoke(release, 'save'), Q.ninvoke(book, 'save')]).spread(function (release) {
                return release;
            });
        });
    } else {
        return null;
    }

};

/**
 * Create multiple books given an array of book data
 * @param {object[]} data - array of book data
 * @returns {Promise} A promise of type Promise<Book[], Error>
 */
LibraryService.prototype.createBooks = function (data) {
    "use strict";
    if (_.isUndefined(data)) {
        data = [];
    }
    if (!_.isArray(data)) {
        data = [data];
    }
    return Q.all(data.map(this.createBook));
};
/**
 * Create a book, looking up the author to attach it to (or creating an author if needed).
 * @param {object} data - Book data
 * @returns {Promise} A promise of type Promise<Book, Error>
 */
LibraryService.prototype.createBook = function (data) {
    "use strict";
    // initial value
    return Q.fcall(function () {
        return data;
    })
    .then(function (data) {
        // if book doesn't have an author id, attempt to find author
        if (!data.authorId) {
            return authorService.findOne({
                where: {
                    name: data.authorName
                }
            })
            .then(function (author) {
                // if author not found, create it given the author name.
                if (!author) {
                    return authorService.create({
                        name: data.authorName,
                        guid: uuid.v4()
                    });
                } else {
                    return author;
                }
            }).then(function (author) {
                // set the book's author id
                data.authorId = author.id;
                return data;
            });
        } else {
            return data;
        }
    }).then(function (data) {
        return bookService.create(data);
    });
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
    if (options.pagingQueryLimit) {
        limit = options.pagingQueryLimit;
    } else {
        limit = (options.onlyNewBooks) ? settingService.get('searchers:googleBooks:pageCounts:searchNewBooks') : settingService.get('searchers:googleBooks:pageCounts:refreshAuthor');
    }
    logger.info('Refreshing author %s', author.name);
    return remoteLibraryService.pagingQuery({
        q: 'inauthor:' + author.name,
        pagingQueryLimit: limit
    }).then(function (remoteBooks) {
        return Q.ninvoke(author, 'getBooks').then(function (books) {
            return bookService.merge(author, books, remoteBooks, !options.onlyNewBooks);
        });
    }).then(function (books) {
        author.books = books;
        return author;
    }.bind(this));
};

/**
 * Refresh all active authors - grabbing their new books.
 * @returns {Promise} A promise of type Promise<Author[], Error>
 */
LibraryService.prototype.refreshActiveAuthors = function () {
    "use strict";
    return authorService.all({
        where: {
            status: 'active'
        }
    }).then(function (authors) {
        if (_.isArray(authors)) {
            return Q.all(authors.map(function (author) {
                return this.refreshAuthor(author, {
                    onlyNewBooks: false
                });
            }.bind(this)));
        } else {
            return [];
        }
    }.bind(this));
};

/**
 * Find and download wanted books for all active authors.
 * @returns {Promise} A promise of type Promise<Object[], Error>
 */
LibraryService.prototype.findAndDownloadWantedBooks = function () {
    "use strict";
    return authorService.all({
        where: {
            status: 'active'
        }
    }).then(function (authors) {
        if (_.isArray(authors)) {
            return Q.all(authors.map(function (author) {
                return Q.ninvoke(author, 'getBooks').then(function (books) {
                    return Q.all(books.map(function (book) {
                        if (book.isWanted()) {
                            return this.findAndDownloadRelease(book);
                        } else {
                            return null;
                        }
                    }.bind(this)));
                }.bind(this));
            }.bind(this)));
        } else {
            return [];
        }
    }.bind(this));
};

module.exports = LibraryService;