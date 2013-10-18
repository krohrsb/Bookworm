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
var AuthorService = require('./author');
var authorService = new AuthorService();

var BookService = require('./book');
var bookService = new BookService();

var LibraryService = function () {
    "use strict";
    events.EventEmitter.call(this);
};

util.inherits(LibraryService, events.EventEmitter);

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
 * Remove an author given their ID. Will also remove the authors' books.
 * @param {Number} id - The ID of the author
 * @returns {Promise} A promise of type Promise<, Error>
 */
LibraryService.prototype.removeAuthorById = function (id) {
    "use strict";
    return authorService.find(id, {}).then(function (author) {
        var error;
        if (author) {
            return Q.ninvoke(author, 'getBooks').then(function (books) {
                return bookService.remove(books);
            }).then(function() {
                authorService.removeById(author.id);
            });
        } else {
            error = new Error('Author could not be found');
            error.statusCode = 404;
            throw error;
        }
    });
};

/**
 * Remove one or more authors in an array - WILL REMOVE THEIR BOOKS
 * @param {object|object[]} authorsData - The ID of the author
 * @returns {Promise} A promise of type Promise<, Error>
 */
LibraryService.prototype.removeAuthors = function (authorsData) {
    "use strict";
    if (!authorsData) {
        authorsData = [];
    }
    if (!_.isArray(authorsData)) {
        authorsData = [authorsData];
    }
    return Q.all(authorsData.map(function (authorData) {
        if (authorData && authorData.id) {
            return this.removeAuthorById(authorData.id);
        } else {
            throw new Error('Author data does not exist or does not contain an author ID');
        }

    }.bind(this)));
};

module.exports = LibraryService;