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
            logger.info('Book %s is now %s, searching for a release', book.title, book.status);
            libraryService.findAndWantRelease(book).fail(function (err) {
                logger.err(err);
            });
        } else if (book.status === 'skipped' || book.status === 'excluded') {
            logger.info('Book %s is now %s, resetting stored releases', book.title, book.status);
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
               logger.err(err);
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
                logger.info('Release %s is now %s, searching for a release', book.title, book.status);
                return libraryService.downloadRelease(book, release).then(function (release) {
                    if (release) {
                        logger.info('Release %s snatched for book %s', release.title, book.title);
                    } else {
                        logger.info('No suitable release found for book %s', book.title);
                    }
                });
            });
        }
    }
});

module.exports = libraryService;