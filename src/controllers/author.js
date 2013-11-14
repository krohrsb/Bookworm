/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/16/13 4:20 PM
 */
var logger = require('../services/log').logger();

var authorService = require('../services/library/author');

var bookService = require('../services/library/book');

var libraryService = require('../services/library');

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
    logger.trace('Controller::Author::getAll');
    authorService.all({
        limit: req.query.limit,
        skip: req.query.offset,
        order: (req.query.sort) ? (req.query.sort + ((req.query.direction) ? ' ' + req.query.direction : ' DESC')) : ''
    }, {
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
    logger.trace('Controller::Author::getById(%s)', req.params.id);

    authorService.find(req.params.id, {
        expand: req.query.expand
    }).then(function (author) {
        if (author) {
            if (req.query.refresh) {
                return libraryService.refreshAuthor(author, {
                    onlyNewBooks: req.query.new || true
                }).then(function (author) {
                    return authorService.find(author.id, {
                        expand: req.query.expand
                    });
                });
            } else {
                return author;
            }
        } else {
            return null;
        }
    }).then(function (author) {
        if (author) {
            res.json(author);
        } else {
            res.json(404);
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
    logger.trace('Controller::Author::getByIdBooks', {authorId: req.params.id});
    bookService.all({
        where: {
            authorId: req.params.id
        },
        order: (req.query.sort) ? (req.query.sort + ((req.query.direction) ? ' ' + req.query.direction : ' DESC')) : ''
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
    logger.trace('Controller::Author::create');
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
    logger.trace('Controller::Author::updateById(%s, {..data..})', req.params.id);
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
    logger.trace('Controller::Author::update({..data..})');
    authorService.updateAll(req.body, {
        expand: req.query.expand,
        sort: req.query.sort
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
    logger.trace('Controller::Author::removeById(%s)', req.params.id);
    authorService.removeById(req.params.id).then(function () {
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
    logger.trace('Controller::Author::remove({..data..})');
    authorService.remove(req.body).then(function () {
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
