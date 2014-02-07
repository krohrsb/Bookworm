/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/15/13 10:33 AM
 */

// Dependencies
var events = require('events');
var util = require('util');
var async = require('async');
var moment = require('moment');
var _ = require('lodash');
var Q = require('q');

// Local Dependencies
var GoogleBooksAPIService = require('./google-books-api');
var GoogleBooksParser = require('./google-books-parser');
var settingService = require('../../setting');
var logger = require('../../log').logger();

var errors = {
    NO_BOOK_DATA: 'No book data provided',
    NO_VOLUME_INFO: 'No volume info avialable for book'
};

/**
 * Google Books Service
 * @param {object} [options] - optional options for the google books api
 * @constructor
 */
var GoogleBooksService = function (options) {
    "use strict";
    this._providerName = 'googlebooks';
    this._api = new GoogleBooksAPIService(options);
    this._parser = new GoogleBooksParser(this._providerName);

    events.EventEmitter.call(this);
};

util.inherits(GoogleBooksService, events.EventEmitter);


/**
 * Update the settings
 * @param {object} settings - new settings
 */
GoogleBooksService.prototype.updateSettings = function (settings) {
    "use strict";
    this._api.updateSettings(settings);
};

/**
 * Construct a Book given Google Book API details
 * @param {object} options - The original options from the query
 * @param {object} data - The google books api book data
 * @returns {Promise} A promise of type Promise<Book|null, Error>
 */
GoogleBooksService.prototype.constructBook = function(options, data) {
    "use strict";
    var volume, book, author, isbn, description, languages, published, deferred, ignoredWords, ignoredWord;

    deferred = Q.defer();

    if (_.isEmpty(data)) {
        deferred.reject(new Error(errors.NO_BOOK_DATA));
    } else if (_.isEmpty(data.volumeInfo)) {
        logger.log('debug', 'Volume info not found, skipping', {query: options.q});
        deferred.resolve();
    } else {
        //noinspection JSUnresolvedVariable
        volume = data.volumeInfo;
        // get author
        author = this._parser.parseAuthor(volume, options.q);
        // get isbn
        isbn = this._parser.parseISBN(volume);
        // get languages
        languages = settingService.get('searchers:googleBooks:filters:languages');

        if (_.isEmpty(languages)) {
            languages = '';
        }

        // get description
        if (!_.isEmpty(volume.description)) {
            description = volume.description.trim();
        }
        //noinspection JSUnresolvedVariable
        published = moment(volume.publishedDate, 'YYYY-MM-DD');

        ignoredWords = settingService.get('searchers:googleBooks:ignoredWords') || '';
        ignoredWords = ignoredWords.split(',');

        ignoredWord = this._parser.detectIgnoredWords(ignoredWords, volume.title);

        if (_.isEmpty(volume.title)) {
            logger.log('debug', 'Title not defined for book, skipping', {guid: data.id});
            deferred.resolve();
        } else if (!author) {
            logger.log('debug', 'Author could not be found for book, skipping', {title: volume.title, author: volume.authors || volume.author});
            deferred.resolve();
        } else if (!_.isEmpty(languages) && !_.contains(languages, volume.language)) {
            logger.log('debug', 'Book language does not match selected language filter, skipping', {title: volume.title, filter: languages, language: languages});
            deferred.resolve();
        } else if (settingService.get('searchers:googleBooks:filters:description') && _.isEmpty(description)) {
            logger.log('debug', 'Book does not contain a description, skipping', {title: volume.title});
            deferred.resolve();
        } else if (settingService.get('searchers:googleBooks:filters:isbn') && _.isEmpty(isbn)) {
            logger.log('debug', 'Industry Identifier (ISBN) not available for Book, skipping', {title: volume.title});
            deferred.resolve();
        } else if (ignoredWord) {
            logger.log('info', 'Book title contains an ignored word, skipping', {ignoredWord: ignoredWord, title: volume.title});
            deferred.resolve();
        } else {
            //noinspection JSUnresolvedVariable,JSUnresolvedFunction
            book = {
                guid: data.id,
                title: volume.title,
                description: description,
                authorName: author,
                publisher: volume.publisher,
                averageRating: (typeof volume.averageRating !== 'undefined') ? volume.averageRating : 0,
                pageCount: volume.pageCount,
                published: published.toDate(),
                image: volume.imageLinks && volume.imageLinks.thumbnail,
                imageSmall: volume.imageLinks && volume.imageLinks.smallThumbnail,
                isbn: isbn,
                language: volume.language,
                status: 'skipped',
                link: volume.canonicalVolumeLink,
                apiLink: data.selfLink,
                provider: this._providerName
            };
            deferred.resolve(book);
        }
    }
    return deferred.promise;
};

/**
 * Sort results
 * @param {object} options - query options
 * @param {object[]} books - books to sort
 * @returns {Promise} A promise of type Promise<Book[], Error>
 * @private
 */
GoogleBooksService.prototype._sort = function (options, books) {
    "use strict";
    return Q.fcall(function () {
        var sorted = _.sortBy(books, function (book) {
            if (typeof book[options.sort] !== 'undefined') {
                return book[options.sort];
            } else {
                return book.published;
            }
        });
        if (options.direction && options.direction.toLowerCase() === 'desc') {
            sorted = sorted.reverse();
        }
        return sorted;
    });
};

/**
 * Query the Google Books API, parsing the response and returning constructed book objects.
 * @param {object} options - The options for the query
 * @returns {Promise} A promise of type Promise<Book[], Error>
 */
GoogleBooksService.prototype.query = function (options) {
    "use strict";

    return this._api.query(options)
        .then(this._parser.parseResponse.bind(this._parser))
        .then(function (items) {
            return Q.all(items.map(_.partial(this.constructBook, options).bind(this)));
        }.bind(this))
        .then(function (books) {
            return _.filter(books, function (book) {
                return _.isObject(book);
            });
        }.bind(this)).then(_.partial(this._sort, options).bind(this));
};

/**
 * Query the Google Books API in a paging fashion, parsing the response and returning constructed book objects.
 * @param {object} options - The options for the query
 * @returns {Promise} A promise of type Promise<Book[], Error>
 */
GoogleBooksService.prototype.pagingQuery = function (options) {
    "use strict";

    return this._api.pagingQuery(options)
        .then(this._parser.parseResponses.bind(this._parser))
        .then(function (items) {
            return Q.all(items.map(_.partial(this.constructBook, options).bind(this)));
        }.bind(this))
        .then(function (books) {
            return _.filter(books, function (book) {
                return _.isObject(book);
            });
        }).then(_.partial(this._sort, options).bind(this));
};

/**
 * Query the Google Books API in for a single book by id, parsing the response and returning the constructed book object.
 * @param {string} id - The id of the book
 * @param {object} options - The options for the query
 * @returns {Promise} A promise of type Promise<Book|null, Error>
 */
GoogleBooksService.prototype.findById = function (id, options) {
    "use strict";

    return this._api.findById(id, options)
        .then(this._parser.parseResponse)
        .then(function (items) {
            if (items && items[0]) {
                return this.constructBook(options, items[0]);
            } else {
                return null;
            }
        }.bind(this));
};

/**
 * Query the Google Books API, parsing the response and compiling a list of authors with a relevance rating.
 * Response is sorted in descending order.
 * @param {object} options - The options for the query
 * @returns {Promise} A promise of type Promise<Author[], Error>
 */
GoogleBooksService.prototype.queryAuthors = function (options) {
    "use strict";
    options = options || {};
    options.q = options.q || '';
    if (options.q.indexOf('inauthor:') === -1) {
        options.q = 'inauthor:' + options.q;
    }
    return this.pagingQuery(options)
        .then(this._parser.collateAuthors.bind(this))
        .then(function (authors) {
            return _.sortBy(authors, function (author) {
                return author.relevance;
            }).reverse();
        });

};

module.exports = GoogleBooksService;