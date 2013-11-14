/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/16/13 4:18 PM
 */

// Dependencies
var events = require('events');
var util = require('util');
var _ = require('lodash');
var Q = require('q');
var mask = require('json-mask');
var uuid = require('node-uuid');

// Local Dependencies
var Author = require('../../../models/author');

/**
 * Author Service
 * @constructor
 */
var AuthorService = function () {
    "use strict";
    this._validUpdateAttributesMask = 'status,updated';
    events.EventEmitter.call(this);
};

util.inherits(AuthorService, events.EventEmitter);

/**
 * Find an author given their ID
 * @param {Number} id - The ID of the author
 * @param {object} options - Find options, supports expand.
 * @returns {Promise} A promise of type Promise<Author|null, Error>
 */
AuthorService.prototype.find = function (id, options) {
    "use strict";
    options = options || {};
    return Q.ninvoke(Author, 'find', id).then(_.partial(this.expandAuthor, options.expand).bind(this));

};

/**
 * Expand an author's books. Load the author's books into their books property.
 * @param {object} author - The author object
 * @returns {Promise} A promise of type Promise<Author, Error>
 */
AuthorService.prototype.expandAuthorBooks = function (author) {
    "use strict";

    if (author) {
        return Q.ninvoke(author, 'getBooks').then(function (books) {
            author.books = books;
            return author;
        });
    } else {
        return Q.fcall(function () {
            throw new Error('No author provided');
        });
    }
};

/**
 * Expand an author's books count.
 * @param {object} author - The author object
 * @returns {Promise} A promise of type Promise<Author, Error>
 */
AuthorService.prototype.expandAuthorBooksCount = function (author) {
    "use strict";

    if (author) {
        return Q.ninvoke(author, 'getBooks').then(function (books) {
            author.booksCount = books.length;
            return author;
        });
    } else {
        return Q.fcall(function () {
            throw new Error('No author provided');
        });
    }
};

/**
 * Expand an author's latest book. Load the author's latest book into their latestBook property.
 * @param {object} author - The author object
 * @returns {Promise} A promise of type Promise<Author, Error>
 */
AuthorService.prototype.expandAuthorLatestBook = function (author) {
    "use strict";
    var latest;

    latest = function (books) {
        var sorted, latest, filtered;
        filtered = _.reject(books, function (book) {
            return book.status === 'excluded';
        });
        sorted = _.sortBy(filtered, 'published');
        latest = _.last(sorted);
        return latest;
    };

    if (author) {
        return Q.ninvoke(author, 'getBooks').then(function (books) {
            author.latestBook = latest(books);
            return author;
        });
    } else {
        return Q.fcall(function () {
            throw new Error('No author provided');
        });
    }
};

/**
 * Expand an author using an expands string to determine what to expand.
 * @param {string} expands - Comma delimited string of expand properties. e.g., books,latestBook
 * @param {object} author - The author object
 * @returns {Promise} A promise of type Promise<Author, Error>
 */
AuthorService.prototype.expandAuthor = function (expands, author) {
    "use strict";
    var types;
    if (expands) {
        types = expands.split(',');
        return Q.fcall(function () {
            if (_.contains(types, 'books')) {
                return this.expandAuthorBooks(author);
            } else {
                return author;
            }
        }.bind(this))
        .then(function (author) {
            if (_.contains(types, 'latestBook')) {
                return this.expandAuthorLatestBook(author);
            } else {
                return author;
            }
        }.bind(this))
        .then(function (author) {
            if (_.contains(types, 'booksCount')) {
                return this.expandAuthorBooksCount(author);
            } else {
                return author;
            }
        }.bind(this));

    } else {
        //noinspection JSHint
        return Q(author);
    }
};

/**
 * Expand multiple authors
 * @param {string} expands - Comma delimited string of expand properties. e.g., books,latestBook
 * @param {object[]} authors - An array of author objects
 * @returns {Promise} A promise of type Promise<Author[], Error>
 */
AuthorService.prototype.expandAuthors = function (expands, authors) {
    "use strict";
    return Q.all((authors || []).map(_.partial(this.expandAuthor, expands).bind(this)));
};

/**
 * Retrieve all authors given the search critera in the 'where' object.
 * @param {object} where - search criteria, can be empty.
 * @param {object} [options] - search options, such as expands
 * @returns {Promise} A promise of type Promise<Author[], Error>
 */
AuthorService.prototype.all = function (where, options) {
    "use strict";
    where = where || {};
    options = options || {};
    return Q.ninvoke(Author, 'all', where).then(_.partial(this.expandAuthors, options.expand).bind(this));
};

/**
 * Counts instances given criteria
 * @param {object} where - search criteria, can be empty.
 * @returns {Promise} A promise of type Promise<Number, Error>
 */
AuthorService.prototype.count = function (where) {
    "use strict";
    return Q.ninvoke(Author, 'count', where);
};

/**
 * Retrieve the first author given the search critera in the 'where' object.
 * @param {object} where - search criteria, can be empty.
 * @param {object} [options] - search options, such as expands
 * @returns {Promise} A promise of type Promise<Author, Error>
 */
AuthorService.prototype.findOne = function (where, options) {
    "use strict";
    where = where || {};
    options = options || {};
    return Q.ninvoke(Author, 'findOne', where).then(_.partial(this.expandAuthor, options.expand).bind(this));
};

/**
 * Create an author. If the author already exists, return the existing.
 * @param {object} data - Author data
 * @returns {Promise} A promise of type Promise<Author, Error>
 */
AuthorService.prototype.create = function (data) {
    "use strict";
    if (data && !data.guid) {
        data.guid = uuid.v4();
    }
    data.updated = Date.now();
    return Q.ninvoke(Author, 'create', data).then(function (author) {
        this.emit('create', author);
        return author;
    }.bind(this));
};

/**
 * Update an author given its ID and some data to update.
 * @param {Number} id - The ID of the author
 * @param {object} data - An object containing data to update
 * @param {object} options - options for the update, such as expand.
 * @returns {Promise} A promise of type Promise<Author, Error>
 */
AuthorService.prototype.updateById = function (id, data, options) {
    "use strict";
    options = options || {};
    if (id) {
        return this.find(id, {})
            .then(function (author) {
                if (author) {
                    return this.update(author, data);
                } else {
                    return null;
                }
            }.bind(this))
            .then(_.partial(this.expandAuthor, options.expand).bind(this));
    } else {
        return Q.fcall(function () {
            var err = new Error('ID property not specified');
            err.statusCode = 400;
            throw err;
        });
    }

};

/**
 * Update an author given the author object and data to update.
 * *NOTE* only allowed attributes will be updated. See _validUpdateAttributesMask
 * @param {object} author - The author object
 * @param {object} data - An object containing data to update
 * @returns {Promise} A promise of type Promise<Author, Error>
 */
AuthorService.prototype.update = function (author, data) {
    "use strict";
    data.updated = Date.now();
    return Q.ninvoke(author, 'updateAttributes', mask(data, this._validUpdateAttributesMask)).then(function (author) {
        this.emit('update', author, _.intersection(_.keys(author), _.keys(data)));
        return author;
    }.bind(this));
};

/**
 * Updates multiple books given their data (provided they have an ID)
 * @param {object[]|object} authorsData - Array of author data or singular author data.
 * @param {object} options - options for the update, such as expand.
 * @returns {Promise} A promise of type Promise<Author[], Error>
 */
AuthorService.prototype.updateAll = function (authorsData, options) {
    "use strict";
    if (!_.isArray(authorsData)) {
        authorsData = [authorsData];
    }
    return Q.all(authorsData.map(function (authorData) {
        return this.updateById(authorData.id, authorData, options);
    }.bind(this)));
};


/**
 * Remove an author given their id - DOES NOT REMOVE THEIR BOOKS
 * @param {Number} id - The book id
 * @returns {Promise} A promise of type Promise<, Error>
 */
AuthorService.prototype.removeById = function (id) {
    "use strict";
    return this.find(id, {}).then(function (author) {
        var error;
        if (author) {
            logger.trace('AuthorService::removeById(%s)', id);
            return Q.ninvoke(author, 'getBooks').then(function (books) {
                return Q.all(books.map(function (book) {
                    return Q.ninvoke(book, 'getReleases').then(function (releases) {
                        return Q.all(releases.map(function (release) {
                            return Q.ninvoke(release, 'destroy');
                        }));
                    });
                }));
            }).then(function () {
                return Q.ninvoke(author, 'destroy').then(function () {
                    this.emit('remove', id);
                }.bind(this));
            }.bind(this));
        } else {
            error = new Error('Author does not exist');
            error.statusCode = 404;
            throw error;
        }
    }.bind(this));
};

/**
 * Remove one or more authors given an array of author data - DOES NOT REMOVE THEIR BOOKS
 * @param {object|object[]} authorsData - The book data
 * @returns {Promise} A promise of type Promise<, Error>
 */
AuthorService.prototype.remove = function (authorsData) {
    "use strict";
    if (_.isUndefined(authorsData)) {
        authorsData = [];
    }
    if (!_.isArray(authorsData)) {
        authorsData = [authorsData];
    }
    return Q.all(authorsData.map(function (authorData) {
        return this.removeById(authorData.id);
    }.bind(this)));
};

module.exports = AuthorService;