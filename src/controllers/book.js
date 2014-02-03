/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/17/13 12:46 PM
 */

var logger = require('../services/log').logger();

var Q = require('q');
var _ = require('lodash');

var libraryService = require('../services/library');

var authorService = require('../services/library/author');

var bookService = require('../services/library/book');

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
    var options = {
        limit: req.query.limit,
        skip: req.query.offset,
        order: (req.query.sort) ? (req.query.sort + ((req.query.direction) ? ' ' + req.query.direction : ' DESC')) : ''
    };

    if (req.query.status) {
        options.where = {
            status: {
                inq: req.query.status.split(',')
            }
        };
    }
    bookService.all(options, {
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
 * Retrieve the releases for a book
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function getByIdReleases (req, res, next) {
    "use strict";
    bookService.findReleases(req.params.id).then(function (releases) {
        if (releases) {
            res.json(releases);
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
    Q.fcall(function () {
        if (_.isArray(req.body)) {
            return libraryService.createBooks(req.body);
        } else {
            return libraryService.createBook(req.body);
        }
    }).then(function (book) {
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
    app.get('/api/v1/books', app.passport.authenticate('localapikey'), getAll);
    app.post('/api/v1/books', app.passport.authenticate('localapikey'), create);
    app.put('/api/v1/books', app.passport.authenticate('localapikey'), update);
    app.del('/api/v1/books', app.passport.authenticate('localapikey'), remove);
    app.get('/api/v1/books/:id', app.passport.authenticate('localapikey'), getById);
    app.get('/api/v1/authors/:aid/books/:id', app.passport.authenticate('localapikey'), getById);
    app.put('/api/v1/books/:id', app.passport.authenticate('localapikey'), updateById);
    app.put('/api/v1/authors/:aid/books/:id', app.passport.authenticate('localapikey'), updateById);
    app.del('/api/v1/books/:id', app.passport.authenticate('localapikey'), removeById);
    app.del('/api/v1/authors/:aid/books/:id', app.passport.authenticate('localapikey'), removeById);
    app.get('/api/v1/books/:id/author', app.passport.authenticate('localapikey'), getByIdAuthor);
    app.get('/api/v1/books/:id/releases', app.passport.authenticate('localapikey'), getByIdReleases);
}
module.exports.setup = setup;
