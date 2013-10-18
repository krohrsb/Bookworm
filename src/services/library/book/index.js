/**
 * @book Kyle Brown <blackbarn@gmail.com>
 * @since 10/17/13 12:48 PM
 */

// Dependencies
var events = require('events');
var util = require('util');
var _ = require('lodash');
var Q = require('q');

// Local Dependencies
var Book = require('../../../models/book');

/**
 * Book Service
 * @constructor
 */
var BookService = function () {
    "use strict";

    this._validUpdateAttributesMask = 'status';

    events.EventEmitter.call(this);
};

util.inherits(BookService, events.EventEmitter);

/**
 * Find an book given its ID
 * @param {Number} id - The ID of the book
 * @param {object} options - Find options, supports expand.
 * @returns {Promise} A promise of type Promise<Book|null, Error>
 */
BookService.prototype.find = function (id, options) {
    "use strict";
    options = options || {};
    return Q.ninvoke(Book, 'find', id).then(_.partial(this.expandBook, options.expand).bind(this));

};

/**
 * Find a author given a book id
 * @param {Number} id - The ID of the book
 * @returns {Promise} A promise of type Promise<Author|null, Error>
 */
BookService.prototype.findAuthor = function (id) {
    "use strict";
    return Q.ninvoke(Book, 'find', id).then(function (book) {
        if (book) {
           return Q.ninvoke(book, 'getAuthor');
        } else {
            return null;
        }
    });
};

/**
 * Expand an book's books. Load the book's books into its books property.
 * @param {object} book - The book object
 * @returns {Promise} A promise of type Promise<Book, Error>
 */
BookService.prototype.expandBookAuthor = function (book) {
    "use strict";

    if (book) {
        return Q.ninvoke(book, 'getAuthor').then(function (author) {
            book.author = author;
            return book;
        });
    } else {
        return Q.fcall(function () {
            throw new Error('No book provided');
        });
    }
};

/**
 * Expand an book using an expands string to determine what to expand.
 * @param {string} expands - Comma delimited string of expand properties. e.g., author,somethingelse
 * @param {object} book - The book object
 * @returns {Promise} A promise of type Promise<Book, Error>
 */
BookService.prototype.expandBook = function (expands, book) {
    "use strict";
    if (expands) {

        return Q.fcall(function () {
                if (_.contains(expands, 'author')) {
                    return this.expandBookAuthor(book);
                } else {
                    return book;
                }
            }.bind(this));

    } else {
        //noinspection JSHint
        return Q(book);
    }
};

/**
 * Expand multiple books
 * @param {string} expands - Comma delimited string of expand properties. e.g., books,latestBook
 * @param {object[]} books - An array of book objects
 * @returns {Promise} A promise of type Promise<Book[], Error>
 */
BookService.prototype.expandBooks = function (expands, books) {
    "use strict";
    return Q.all((books || []).map(_.partial(this.expandBook, expands).bind(this)));
};

/**
 * Retrieve all books given the search critera in the 'where' object.
 * @param {object} where - search criteria, can be empty.
 * @param {object} [options] - search options, such as expands
 * @returns {Promise} A promise of type Promise<Book[], Error>
 */
BookService.prototype.all = function (where, options) {
    "use strict";
    where = where || {};
    options = options || {};
    return Q.ninvoke(Book, 'all', where).then(_.partial(this.expandBooks, options.expand).bind(this));
};

/**
 * Counts instances given criteria
 * @param {object} where - search criteria, can be empty.
 * @returns {Promise} A promise of type Promise<Number, Error>
 */
BookService.prototype.count = function (where) {
    "use strict";
    return Q.ninvoke(Book, 'count', where);
};


/**
 * Retrieve the first book given the search critera in the 'where' object.
 * @param {object} where - search criteria, can be empty.
 * @param {object} [options] - search options, such as expands
 * @returns {Promise} A promise of type Promise<Book, Error>
 */
BookService.prototype.findOne = function (where, options) {
    "use strict";
    where = where || {};
    options = options || {};
    return Q.ninvoke(Book, 'findOne', where).then(_.partial(this.expandBook, options.expand).bind(this));
};

/**
 * Create a book.
 * @param {object} data - Book data
 * @returns {Promise} A promise of type Promise<Book, Error>
 */
BookService.prototype.create = function (data) {
    "use strict";
    return Q.ninvoke(Book, 'create', data);
};

/**
 * Update a book given its ID and some data to update.
 * @param {Number} id - The ID of the book
 * @param {object} data - An object containing data to update
 * @param {object} options - options for the update, such as expand.
 * @returns {Promise} A promise of type Promise<Book, Error>
 */
BookService.prototype.updateById = function (id, data, options) {
    "use strict";
    options = options || {};
    if (id) {
        return this.find(id, {})
            .then(function (book) {
                if (book) {
                    return this.update(book, data);
                } else {
                    return null;
                }
            }.bind(this))
            .then(_.partial(this.expandBook, options.expand).bind(this));
    } else {
        return Q.fcall(function () {
            var err = new Error('ID property not specified');
            err.statusCode = 400;
            throw err;
        });
    }

};

/**
 * Update a book given the book object and data to update.
 * *NOTE* only allowed attributes will be updated. See _validUpdateAttributesMask
 * @param {object} book - The book object
 * @param {object} data - An object containing data to update
 * @returns {Promise} A promise of type Promise<Book, Error>
 */
BookService.prototype.update = function (book, data) {
    "use strict";
    return Q.ninvoke(book, 'updateAttributes', mask(data, this._validUpdateAttributesMask));
};

/**
 * Updates multiple books given their data (provided they have an ID)
 * @param {object[]|object} booksData - Array of book data or singular book data.
 * @param {object} options - options for the update, such as expand.
 * @returns {Promise} A promise of type Promise<Book[], Error>
 */
BookService.prototype.updateAll = function (booksData, options) {
    "use strict";
    if (!_.isArray(booksData)) {
        booksData = [booksData];
    }
    return Q.all(booksData.map(function (bookData) {
        return this.updateById(bookData.id, bookData, options);
    }.bind(this)));
};

/**
 * Remove a book given its id
 * @param {Number} id - The book id
 * @returns {Promise} A promise of type Promise<, Error>
 */
BookService.prototype.removeById = function (id) {
    "use strict";
    return this.find(id, {}).then(function (book) {
        var error;
        if (book) {
            Q.ninvoke(book, 'destroy');
        } else {
            error = new Error('Book does not exist');
            error.statusCode(404);
            throw error;
        }
    });
};

/**
 * Remove one or more books given an array of book data
 * @param {object[]} booksData - The book data
 * @returns {Promise} A promise of type Promise<, Error>
 */
BookService.prototype.remove = function (booksData) {
    "use strict";
    if (!_.isArray(booksData)) {
        booksData = [booksData];
    }
    return Q.all(booksData.map(function (bookData) {
        return this.removeById(bookData.id);
    }.bind(this)));
};

module.exports = BookService;