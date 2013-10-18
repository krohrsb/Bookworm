/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/17/13 12:46 PM
 */

var Q = require('q');
var LibraryService = require('../services/library');
var libraryService = new LibraryService();

var BookService = require('../services/library/book');
var bookService = new BookService();

var AuthorService = require('../services/library/author');
var authorService = new AuthorService();

var ModelValidationService = require('../services/model-validation');
var modelValidationService = new ModelValidationService();

//noinspection JSUnusedLocalSymbols
/**
 * Retrieve all books
 * Supports expand and fields to alter the response.
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function getAll (req, res, next) {
    'use strict';

    bookService.all({}, {
        expand: req.query.expand
    }).then(res.json.bind(res), next);
}

//noinspection JSUnusedLocalSymbols
/**
 * Retrieve a book by id
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function getById (req, res, next) {
    'use strict';

    bookService.find(req.params.id, {
        expand: req.query.expand
    }).then(function (book) {
        if (book) {
            res.json(book);
        } else {
            res.send(404);
        }
    }, next);
}

//noinspection JSUnusedLocalSymbols
/**
 * Retrieve the author of a book
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function getByIdAuthor (req, res, next) {
    "use strict";
    bookService.findAuthor(req.params.id).then(function (author) {
        if (author) {
            return authorService.expandAuthor(req.query.expand, author);
        } else {
            return null;
        }
    }).then(function (author) {
        if (author) {
            res.json(author);
        } else {
            res.send(404);
        }
    }, next);
}


//noinspection JSUnusedLocalSymbols
/**
 * Create a book
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function create (req, res, next) {
    "use strict";

    libraryService.createBook(req.body).then(function (book) {
        if (book) {
            res.json(201, book);
        } else {
            res.send(409);
        }
    }, function (err) {
        modelValidationService.formatError(err).then(next, next);
    });


}

//noinspection JSUnusedLocalSymbols
/**
 * Update an author given their id
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function updateById (req, res, next) {
    "use strict";
    bookService.updateById(req.params.id, req.body, {
        expand: req.query.expand
    }).then(function (book) {
        if (book) {
            res.json(200, book);
        } else {
            res.send(404);
        }
    }, function (err) {
        modelValidationService.formatError(err).then(next, next);
    });
}

//noinspection JSUnusedLocalSymbols
/**
 * Update an author given their data, may be multiple
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function update (req, res, next) {
    "use strict";
    bookService.updateAll(req.body, {
        expand: req.query.expand
    }).then(function (books) {
        if (books) {
            res.json(200, books);
        } else {
            res.send(409);
        }
    }, function (err) {
        modelValidationService.formatError(err).then(next, next);
    });
}

//noinspection JSUnusedLocalSymbols
/**
 * Remove a book
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function removeById (req, res, next) {
    "use strict";
    bookService.removeById(req.params.id).then(function () {
        res.send(204);
    }, function (err) {
        modelValidationService.formatError(err).then(next, next);
    });
}

//noinspection JSUnusedLocalSymbols
/**
 * Remove one or more books in an array
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function remove (req, res, next) {
    "use strict";

    bookService.remove(req.body).then(function () {
        res.send(204);
    }, function (err) {
        modelValidationService.formatError(err).then(next, next);
    });
}

function setup (app) {
    "use strict";
    app.get('/api/v1/books', getAll);
    app.post('/api/v1/books', create);
    app.put('/api/v1/books', update);
    app.del('/api/v1/books', remove);
    app.get('/api/v1/books/:id', getById);
    app.put('/api/v1/books/:id', updateById);
    app.del('/api/v1/books/:id', removeById);
    app.get('/api/v1/books/:id/author', getByIdAuthor);
}
module.exports.setup = setup;
