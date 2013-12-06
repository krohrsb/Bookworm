/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/22/13 10:26 AM
 */

var logger = require('../services/log').logger();

var releaseService = require('../services/library/release');

var bookService = require('../services/library/book');

var ModelValidationService = require('../services/model-validation');
var modelValidationService = new ModelValidationService();

//noinspection JSUnusedLocalSymbols
/**
 * Retrieve all releases
 * Supports expand and fields to alter the response.
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function getAll (req, res, next) {
    'use strict';
    logger.trace('Controller::Release::getAll');
    releaseService.all({
        limit: req.query.limit,
        skip: req.query.offset,
        order: (req.query.sort) ? (req.query.sort + ((req.query.direction) ? ' ' + req.query.direction : '')) : ''
    }, {
        expand: req.query.expand
    }).then(res.json.bind(res), next);
}

//noinspection JSUnusedLocalSymbols
/**
 * Retrieve a release by id
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function getById (req, res, next) {
    'use strict';
    logger.trace('Controller::Release::getById(%s)', req.params.id);
    releaseService.find(req.params.id, {
        expand: req.query.expand
    }).then(function (release) {
        if (release) {
            res.json(release);
        } else {
            res.send(404);
        }
    }, next);
}

//noinspection JSUnusedLocalSymbols
/**
 * Retrieve the release's book
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function getByIdBook (req, res, next) {
    "use strict";
    logger.trace('Controller::Book::getByIdBook(%s)', req.params.id);
    releaseService.findBook(req.params.id).then(function (book) {
        if (book) {
            return bookService.expandBook(req.query.expand, book);
        } else {
            return null;
        }
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
 * Create a release
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function create (req, res, next) {
    "use strict";
    logger.trace('Controller::Release::create');
    releaseService.create(req.body).then(function (release) {
        res.json(201, release);
    }, function (err) {
        modelValidationService.formatError(err).then(next, next);
    });
}

//noinspection JSUnusedLocalSymbols
/**
 * Update a release given its id
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function updateById (req, res, next) {
    "use strict";
    logger.trace('Controller::Release::updateById(%s, {..data..})', req.params.id);
    releaseService.updateById(req.params.id, req.body, {
        expand: req.query.expand
    }).then(function (release) {
        if (release) {
            res.json(200, release);
        } else {
            res.send(404);
        }
    }, function (err) {
        modelValidationService.formatError(err).then(next, next);
    });
}

//noinspection JSUnusedLocalSymbols
/**
 * Update a release given its data, may be multiple
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function update (req, res, next) {
    "use strict";
    logger.trace('Controller::Release::update({..data..})');
    releaseService.updateAll(req.body, {
        expand: req.query.expand
    }).then(function (releases) {
            if (releases) {
                res.json(200, releases);
            } else {
                res.send(409);
            }
        }, function (err) {
            modelValidationService.formatError(err).then(next, next);
        });
}

//noinspection JSUnusedLocalSymbols
/**
 * Remove a release given its id
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function removeById (req, res, next) {
    "use strict";
    logger.trace('Controller::Release::removeById(%s)', req.params.id);
    releaseService.removeById(req.params.id).then(function () {
        res.send(204);
    }, function (err) {
        modelValidationService.formatError(err).then(next, next);
    });
}

//noinspection JSUnusedLocalSymbols
/**
 * Remove one or more releases in a array
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function remove (req, res, next) {
    "use strict";
    logger.trace('Controller::Release::remove({..data..})');
    releaseService.remove(req.body).then(function () {
        res.send(204);
    }, function (err) {
        modelValidationService.formatError(err).then(next, next);
    });
}

function setup (app) {
    "use strict";
    app.get('/api/v1/releases', app.passport.authenticate('localapikey'), getAll);
    app.get('/api/v1/releases/:id', app.passport.authenticate('localapikey'), getById);
    app.get('/api/v1/books/:bid/releases/:id', app.passport.authenticate('localapikey'), getById);
    app.get('/api/v1/releases/:id/book', app.passport.authenticate('localapikey'), getByIdBook);
    app.post('/api/v1/releases', app.passport.authenticate('localapikey'), create);
    app.put('/api/v1/releases/:id', app.passport.authenticate('localapikey'), updateById);
    app.put('/api/v1/books/:bid/releases/:id', app.passport.authenticate('localapikey'), updateById);
    app.put('/api/v1/releases', app.passport.authenticate('localapikey'), update);
    app.del('/api/v1/releases', app.passport.authenticate('localapikey'), remove);
    app.del('/api/v1/releases/:id', app.passport.authenticate('localapikey'), removeById);
}
module.exports.setup = setup;