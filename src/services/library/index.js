/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/22/13 9:50 AM
 */

// Dependencies
var _ = require('lodash');
var Q = require('q');

// Local Dependencies
var LibraryService = require('./library');
var libraryService = new LibraryService();
var logger = require('../log');
var db = require('../../config/models');


/**
 * On book status updated perform operations
 * When wanted, attempt to find and want a release for that book.
 * When skipped or excluded, set all associated releases to available.
 */
db.emitter.on('book/statusUpdated', function (book) {
    'use strict';
    if (book.status === 'wanted' || book.status === 'wanted_new') {
        logger.log('info', 'Book status updated, searching for release', {title: book.title, status: book.status});
        libraryService.findAndWantRelease(book).fail(function (err) {
            logger.log('error', err.message, err.stack);
        });
    } else if (book.status === 'skipped' || book.status === 'excluded') {
        logger.log('info', 'Book status updated to skipped/excluded. Resetting associated releases', {title: book.title, status: book.status});
        book.getReleases().then(function (releases) {
            if (releases) {
                return Q.all(releases.map(function (release) {
                    return release.updateAttributes({status: 'available'});
                }));
            } else {
                return null;
            }
        }, function (err) {
            logger.log('error', err.message, err.stack);
        });
    }
});

/**
 * On release status updated perform operations
 * When wanted, attempt to download the release
 */
db.emitter.on('release/statusUpdated', function (release) {
    'use strict';
    if (release.status === 'wanted') {
        release.getBook().then(function(book) {
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
});
module.exports = libraryService;