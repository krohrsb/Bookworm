/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/17/13 12:46 PM
 */

var logger = require('../services/log');

var Q = require('q');
var _ = require('lodash');
var uuid = require('node-uuid');
var db = require('../config/models');

//var libraryService = require('../services/library');

//published,imageSmall,image,apiLink,isbn,provider,language,publisher,pageCount,description,link,title

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
        include: [db.Release, db.Author],
        limit: req.query.limit,
        offset: req.query.offset,
        order: (req.query.sort) ? (req.query.sort + ((req.query.direction) ? ' ' + req.query.direction : ' DESC')) : ''
    };

    if (req.query.status) {
        options.where = {
            status: req.query.status.split(',')
        };
    }
    db.Book.all(options).then(res.json.bind(res), next);
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
    db.Book.find({
        where: {
            id: req.params.id
        },
        include: [db.Author, db.Release]
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
    db.Book.find({
        where: {
            id: req.params.id
        },
        include: [db.Author]
    }).then(function (book) {
        if (book) {
            res.json(book.author);
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
    db.Book.find({
        where: {
            id: req.params.id
        },
        include: [db.Release]
    }).then(function (book) {
        if (book) {
            res.json(book.releases);
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
    db.Book.findOrCreate({
        guid: req.body.guid
    }, req.body).spread(function (book, created) {
        if (created) {
            return db.Author.findOrCreate({
                name: book.authorName
            }, {
                guid: uuid.v4()
            }).spread(function (author) {
                    return book.setAuthor(author);
                });
        } else {
            return book;
        }
    }).then(function (book) {
        if (book) {
            res.json(201, book);
        } else {
            res.send(409);
        }
    }, next);


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
    db.Book.find({
        where: {
            id: req.params.id
        },
        include: [db.Author, db.Release]
    }).then(function (book) {
        if (book) {
            return book.updateAttributes(req.body, ['status']);
        } else {
            return null;
        }
    }).then(function (book) {
        if (book) {
            res.json(200, book);
        } else {
            res.send(404);
        }
    }, next);
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
    if (_.isArray(req.body)) {
        Q.all(req.body.map(function (book) {
            return db.Book.find({
                where: {
                    id: book.id
                },
                include: [db.Author, db.Release]
            }).then(function (foundBook) {
                if (foundBook) {
                    return foundBook.updateAttributes(book, ['status']);
                } else {
                    return book;
                }
            });
        })).then(function (books) {
            if (books) {
                res.json(200, books);
            } else {
                res.send(409);
            }
        });
    } else {
        next(new Error('Expecting an array for update'));
    }
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
    db.Book.find(req.params.id).then(function (book) {
        if (book) {
            book.destroy().then(function () {
                res.send(204);
            }, next);
        } else {
            res.send(404);
        }
    }, next);
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
    db.Book.destroy(req.body).then(function () {
        res.send(204);
    }, next);
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
