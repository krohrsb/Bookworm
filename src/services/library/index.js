/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/22/13 9:50 AM
 */

// Dependencies
var _ = require('lodash');
var Q = require('q');

// Local Dependencies
var LibraryService = require('./library');
var releaseService = require('./release');
var bookService = require('./book');
var libraryService = new LibraryService();
var logger = require('../log').logger();

// on book update, check its status, if a variant of wanted, try and find a release
bookService.on('update', function (book, propertiesChanged) {
    'use strict';
    if (_.contains(propertiesChanged, 'status')) {
        if (book.status === 'wanted' || book.status === 'wanted_new') {
            logger.log('info', 'Book status updated, searching for release', {title: book.title, status: book.status});
            libraryService.findAndWantRelease(book).fail(function (err) {
                logger.log('error', err.message, err.stack);
            });
        } else if (book.status === 'skipped' || book.status === 'excluded') {
            logger.log('info', 'Book status updated, searching for release', {title: book.title, status: book.status});
            Q.ninvoke(book, 'getReleases').then(function (releases) {
                if (releases) {
                    releases.forEach(function (release) {
                        release.status = 'available';
                    });
                    return releaseService.updateAll(releases);
                } else {
                    return null;
                }
            }).fail(function (err) {
               logger.log('error', err.message, err.stack);
            });
        }
    }
});

releaseService.on('update', function (release, propertiesChanged) {
    'use strict';
    if (_.contains(propertiesChanged, 'status')) {
        if (release.status === 'wanted') {
            releaseService.clearWanted().then(function () {
                return Q.ninvoke(release, 'getBook');
            }).then(function (book) {
                logger.log('info', 'Release status updated, searching for release', {title: book.title, status: book.status});
                return libraryService.downloadRelease(book, release).then(function (release) {
                    if (release) {
                        logger.log('info', 'Release snatched for book', {release: release.title, book: book.title});
                    } else {
                        logger.log('info', 'No suitable release found for book', {title: book.title});
                    }
                });
            });
        }
    }
});

module.exports = libraryService;