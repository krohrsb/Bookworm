/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/16/13 4:20 PM
 */
var LibraryService = require('../services/library');
var libraryService = new LibraryService();

var AuthorService = require('../services/library/author');
var authorService = new AuthorService();

var BookService = require('../services/library/book');
var bookService = new BookService();

var ModelValidationService = require('../services/model-validation');
var modelValidationService = new ModelValidationService();

//noinspection JSUnusedLocalSymbols
/**
 * Retrieve all authors
 * Supports expand and fields to alter the response.
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function getAll (req, res, next) {
    'use strict';

    authorService.all({}, {
        expand: req.query.expand
    }).then(res.json.bind(res), next);
}

//noinspection JSUnusedLocalSymbols
/**
 * Retrieve an author by id
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function getById (req, res, next) {
    'use strict';

    authorService.find(req.params.id, {
        expand: req.query.expand
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
 * Retrieve an authors books given the author id
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function getByIdBooks (req, res, next) {
    "use strict";
    bookService.all({
        where: {
            authorId: req.params.id
        }
    }, {
        expand: req.query.expand
    }).then(function (books) {
        if (books) {
            res.json(books);
        } else {
            res.send(404);
        }
    }, next);
}

//noinspection JSUnusedLocalSymbols
/**
 * Create an author
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function create (req, res, next) {
    "use strict";
    authorService.create(req.body).then(function (author) {
        res.json(201, author);
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
    authorService.updateById(req.params.id, req.body, {
        expand: req.query.expand
    }).then(function (author) {
        if (author) {
            res.json(200, author);
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
    authorService.updateAll(req.body, {
        expand: req.query.expand
    }).then(function (authors) {
        if (authors) {
            res.json(200, authors);
        } else {
            res.send(409);
        }
    }, function (err) {
        modelValidationService.formatError(err).then(next, next);
    });
}

//noinspection JSUnusedLocalSymbols
/**
 * Remove a author given their id - WILL REMOVE THEIR BOOKS
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function removeById (req, res, next) {
    "use strict";
    libraryService.removeAuthorById(req.params.id).then(function () {
        res.send(204);
    }, function (err) {
        modelValidationService.formatError(err).then(next, next);
    });
}

//noinspection JSUnusedLocalSymbols
/**
 * Remove one or more authors in an array - WILL REMOVE THEIR BOOKS
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function remove (req, res, next) {
    "use strict";

    libraryService.removeAuthors(req.body).then(function () {
        res.send(204);
    }, function (err) {
        modelValidationService.formatError(err).then(next, next);
    });
}

function setup (app) {
    "use strict";
    app.get('/api/v1/authors', getAll);
    app.get('/api/v1/authors/:id', getById);
    app.get('/api/v1/authors/:id/books', getByIdBooks);
    app.post('/api/v1/authors', create);
    app.put('/api/v1/authors/:id', updateById);
    app.put('/api/v1/authors', update);
    app.del('/api/v1/authors', remove);
    app.del('/api/v1/authors/:id', removeById);
}
module.exports.setup = setup;
