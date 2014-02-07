/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/16/13 4:20 PM
 */
var logger = require('../services/log').logger();
var uuid = require('node-uuid');
var _ = require('lodash');
var db = require('../config/models');
var libraryService = require('../services/library');

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
    db.Author.all({
        include: [db.Book],
        offset: req.query.offset,
        limit: req.query.limit,
        order: (req.query.sort) ? (req.query.sort + ((req.query.direction) ? ' ' + req.query.direction : ' DESC')) : ''
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

    db.Author.find({
        where: {
            id: req.params.id
        },
        include: [db.Book]
    }).then(function (author) {
        if (author) {
            if (req.query.refresh) {
                return libraryService.refreshAuthor(author, {
                    onlyNewBooks: (req.query.newBooks === 'true')
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
    db.Author.find({
        where: {
            id: req.params.id
        },
        include: [db.Book]
    }).then(function (author) {
        if (author) {
            res.json(author.books);
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
    db.Author.create(_.extend(req.body, { guid: uuid.v4()})).then(function (author) {
        res.json(201, author);
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
    db.Author.find({
        where: {
            id: req.params.id
        },
        include: [db.Book]
    }).then(function (author) {
        if (author) {
            return author.updateAttributes(req.body, ['status']);
        } else {
            return null;
        }
    }).then(function (author) {
        if (author) {
            res.json(200, author);
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
        Q.all(req.body.map(function (author) {
            return db.Author.find({
                where: {
                    id: author.id
                },
                include: [db.Book]
            }).then(function (foundAuthor) {
                if (foundAuthor) {
                    return foundAuthor.updateAttributes(author, ['status']);
                } else {
                    return author;
                }
            });
        })).then(function (authors) {
            if (authors) {
                res.json(200, authors);
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
 * Remove a author given their id - WILL REMOVE THEIR BOOKS
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function removeById (req, res, next) {
    "use strict";
    db.Author.find({
        where: {
            id: req.params.id
        }
    }).then(function (author) {
        if (author) {
            author.destroy().then(function () {
                res.send(204);
            }, next);
        } else {
            res.send(404);
        }
    }, next);
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
    db.Author.destroy(req.body).then(function () {
        res.send(204);
    }, next);
}



function setup (app) {
    "use strict";
    app.get('/api/v1/authors', app.passport.authenticate('localapikey'), getAll);
    app.get('/api/v1/authors/:id', app.passport.authenticate('localapikey'), getById);
    app.get('/api/v1/authors/:id/books', app.passport.authenticate('localapikey'), getByIdBooks);
    app.post('/api/v1/authors', app.passport.authenticate('localapikey'), create);
    app.put('/api/v1/authors/:id', app.passport.authenticate('localapikey'), updateById);
    app.put('/api/v1/authors', app.passport.authenticate('localapikey'), update);
    app.del('/api/v1/authors', app.passport.authenticate('localapikey'), remove);
    app.del('/api/v1/authors/:id', app.passport.authenticate('localapikey'), removeById);
}
module.exports.setup = setup;
