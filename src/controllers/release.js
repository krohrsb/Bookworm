/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/22/13 10:26 AM
 */

var logger = require('../services/log');

var Q = require('q');
var _ = require('lodash');
var db = require('../config/models');
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
    var options = {
        include: [db.Book],
        limit: req.query.limit,
        offset: req.query.offset,
        order: (req.query.sort) ? (req.query.sort + ((req.query.direction) ? ' ' + req.query.direction : ' DESC')) : ''
    };
    db.Release.all(options).then(res.json.bind(res), next);
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
    db.Release.find({
        where: {
            id: req.params.id
        },
        include: [db.Book]
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
    db.Release.find({
        where: {
            id: req.params.id
        },
        include: [db.Book]
    }).then(function (release) {
        if (release) {
            res.json(release.book);
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
    db.Release.findOrCreate({
        guid: req.body.guid
    }, req.body).spread(function (release) {
        if (release) {
            res.json(201, release);
        } else {
            res.send(409);
        }
    }, next);
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
    db.Release.find({
        where: {
            id: req.params.id
        },
        include: [db.Book]
    }).then(function (release) {
        if (release) {
            return release.updateAttributes(req.body, ['status']);
        } else {
            return null;
        }
    }).then(function (release) {
        if (release) {
            res.json(200, release);
        } else {
            res.send(404);
        }
    }, next);
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

    if (_.isArray(req.body)) {
        Q.all(req.body.map(function (release) {
                return db.Release.find({
                    where: {
                        id: release.id
                    },
                    include: [db.Book]
                }).then(function (foundRelease) {
                        if (foundRelease) {
                            return foundRelease.updateAttributes(release, ['status']);
                        } else {
                            return release;
                        }
                    });
            })).then(function (releases) {
                if (releases) {
                    res.json(200, releases);
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
 * Remove a release given its id
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function removeById (req, res, next) {
    "use strict";

    db.Release.find(req.params.id).then(function (release) {
        if (release) {
            release.destroy().then(function () {
                res.send(204);
            }, next);
        } else {
            res.send(404);
        }
    }, next);
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
    db.Release.destroy(req.body).then(function () {
        res.send(204);
    }, next);
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