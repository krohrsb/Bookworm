/**
 * @book Kyle Brown <blackbarn@gmail.com>
 * @since 10/17/13 12:48 PM
 */

// Dependencies
var events = require('events');
var util = require('util');
var _ = require('lodash');
var Q = require('q');
var mask = require('json-mask');
var libxmljs = require('libxmljs');

// Local Dependencies
var Book = require('../../../models/book');
var logger = require('../../log').logger();
/**
 * Book Service
 * @constructor
 */
var BookService = function () {
    "use strict";

    events.EventEmitter.call(this);

    this._validUpdateAttributesMask = 'status,updated';
    this._validMergeAttributesMask = 'published,imageSmall,image,apiLink,isbn,provider,language,publisher,pageCount,description,link,title';

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
 * Find the releases of a given book by id
 * @param {Number} id - The ID of the book
 * @returns {Promise} A promise of type Promise<Author|null, Error>
 */
BookService.prototype.findReleases = function (id) {
    "use strict";
    return Q.ninvoke(Book, 'find', id).then(function (book) {
        if (book) {
            return Q.ninvoke(book, 'getReleases');
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
 * Expand a book's releases. Load the book's releases into its releases property.
 * @param {object} book - The book object
 * @returns {Promise} A promise of type Promise<Book, Error>
 */
BookService.prototype.expandBookReleases = function (book) {
    "use strict";

    if (book) {
        return Q.ninvoke(book, 'getReleases').then(function (releases) {
            book.releases = releases;
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
            }.bind(this)).then(function (book) {
                if (_.contains(expands, 'releases')) {
                    return this.expandBookReleases(book);
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
 * Retrieve all books given the search criteria in the 'where' object.
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
    return Q.ninvoke(Book, 'create', data).then(function (book) {
        this.emit('create', book);
        return book;
    }.bind(this));
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
 * @param {string} [attrMask] - optional mask that determines which fields get updated.
 * @returns {Promise} A promise of type Promise<Book, Error>
 */
BookService.prototype.update = function (book, data, attrMask) {
    "use strict";
    data = data || {};
    data.updated = Date.now();
    data = mask(data, attrMask || this._validUpdateAttributesMask);

    return Q.ninvoke(book, 'updateAttributes', data).then(function (book) {
        this.emit('update', book, _.intersection(_.keys(book.toJSON()), _.keys(data)));
        return book;
    }.bind(this));
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
            return Q.ninvoke(book, 'getReleases').then(function (releases) {
                return Q.all(releases.map(function (release) {
                    return Q.ninvoke(release, 'destroy');
                }));
            }).then(function () {
                return Q.ninvoke(book, 'destroy').then(function () {
                    this.emit('remove', id);
                }.bind(this));
            }.bind(this));
        } else {
            error = new Error('Book does not exist');
            error.statusCode = 404;
            throw error;
        }
    }.bind(this));
};

/**
 * Remove one or more books given an array of book data
 * @param {object[]} booksData - The book data
 * @returns {Promise} A promise of type Promise<, Error>
 */
BookService.prototype.remove = function (booksData) {
    "use strict";
    if (_.isUndefined(booksData)) {
        booksData = [];
    }
    if (!_.isArray(booksData)) {
        booksData = [booksData];
    }
    return Q.all(booksData.map(function (bookData) {
        return this.removeById(bookData.id);
    }.bind(this)));
};

/**
 * Retrieve the OPF string for this book.
 * @param {object} book - the book object
 * @returns {Promise} A promise of type Promise<String, Error>
 */
BookService.prototype.getOpf = function (book) {
    "use strict";
    var doc, ref;
    doc = new libxmljs.Document();
    ref = doc.node('package').attr({xmlns: 'http://www.idpf.org/2007/opf'})
        .node('metadata').attr({'xmlns:dc': 'http://purl.org/dc/elements/1.1/', 'xmlns:opf': 'http://www.idpf.org/2007/opf'})
        .node('dc:title', book.title).parent()
        .node('dc:creator', book.authorName).attr({'opf:role': 'aut'}).parent()
        .node('dc:language', book.language).parent()
        .node('dc:identifier', book.guid).attr({'opf:scheme': book.provider}).parent();
    if (!_.isEmpty(book.isbn)) {
        ref = ref.node('dc:identifier', book.isbn).attr({'opf:scheme': 'ISBN'}).parent();
    }
    if (!_.isEmpty(book.publisher)) {
        ref = ref.node('dc:publisher', book.publisher).parent();
    }
    if (!_.isEmpty(book.published)) {
        ref = ref.node('dc:date', book.published).parent();
    }
    if (!_.isEmpty(book.description)) {
        ref = ref.node('dc:description', book.description).parent();
    }
    ref.node('guide')
        .node('reference').attr({href: 'cover.jpg', type: 'cover', title: 'Cover'});
    //noinspection JSHint
    return Q(doc.toString());
};

/**
 * Merge two sets of books together. Optionally merge matching book data.
 * @param {object} author - The author associated with these books
 * @param {object[]} destination - Existing books
 * @param {object[]} source - New books
 * @param {Boolean} [mergeData] - Flag to indicate if book data should be merged.
 * @returns {Promise} A promise of type Promise<Book[], Error>
 */
BookService.prototype.merge = function (author, destination, source, mergeData) {
    "use strict";
    if (_.isArray(destination) && _.isArray(source)) {
        return Q.fcall(function () {
            if (mergeData) {
                return Q.all(destination.map(function (destinationBook) {
                    var sourceBook;
                    sourceBook = _.find(source, function (sourceBook) {
                        return destinationBook.guid === sourceBook.guid;
                    });
                    return this.update(destinationBook, sourceBook, this._validMergeAttributesMask);
                }.bind(this)));
            } else {
                return destination;
            }
        }.bind(this)).then(function (destination) {
            return _.reject(source, function (sourceBook) {
                return _.any(destination, function (destinationBook) {
                    return (sourceBook.guid === destinationBook.guid || sourceBook.title === destinationBook.title);
                });
            });
        }).then(function (newBooks) {
            _.forEach(newBooks, function (book) {
                book.authorId = author.id;
            });
            return newBooks;
        }).then(function (newBooks) {
            return Q.all(newBooks.map(this.create.bind(this)));
        }.bind(this)).then(function (savedBooks) {
            logger.debug('Finished merging books for author %s. Did %s merge book data. %s new books.', author.name, ((mergeData) ? '': 'not'), savedBooks.length);
            return savedBooks.concat(destination);
        });
    } else {
        return Q.fcall(function () {
            throw new Error('Source/destination not an array');
        });
    }
};

module.exports = BookService;