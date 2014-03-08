/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/22/13 10:26 AM
 */

// Dependencies
var swagger = require('swagger-node-express');
var uuid = require('node-uuid');
var _ = require('lodash');
var Q = require('q');
// Local Dependencies
var logger = require('../services/log');
var db = require('../config/models');
var util = require('../config/routes/util');


var getAll = {
    spec: {
        path: '/releases',
        notes: 'Returns a list of all releases.',
        summary: 'Get All Releases',
        method: 'GET',
        type : 'array',
        items: {
            $ref: 'Release'
        },
        nickname: 'getAllReleases',
        produces: ['application/json'],
        parameters: [
            util.params.offset,
            util.params.limit,
            util.params.sort,
            util.params.direction,
            util.params.expand,
            util.params.fields
        ]
    },
    //noinspection JSUnusedLocalSymbols
    /**
     * Retrieve all releases
     * Supports expand and fields to alter the response.
     * @param {object} req - The Request object.
     * @param {object} res - The Response object.
     */
    action: function (req, res) {
        'use strict';
        var options = {
            include: util.parseExpand(req.query.expand, db, ['book']),
            limit: req.query.limit,
            offset: req.query.offset,
            order: (req.query.sort) ? (req.query.sort + ((req.query.direction) ? ' ' + req.query.direction : ' DESC')) : ''
        };
        db.Release.all(options).then(res.json.bind(res));
    }
};

/**
 * Retrieve a release by id
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 */
var getByIdAction = function (req, res) {
    'use strict';
    if (!req.params.id) {
        util.errors.invalid('id', res);
    } else {
        db.Release.find({
            where: {
                id: req.params.id
            },
            include: util.parseExpand(req.query.expand, db, ['book'])
        }).then(function (release) {
            if (release) {
                res.json(release);
            } else {
                util.errors.notFound('Release', res);
            }
        });
    }

};

var getById = {
    spec: {
        path: '/releases/{id}',
        notes: '',
        summary: 'Get Release by id',
        method: 'GET',
        type: 'Release',
        nickname: 'getReleaseById',
        produces: ['application/json'],
        parameters: [
            util.params.id,
            util.params.expand,
            util.params.fields
        ],
        responseMessages: [util.errors.notFound('Release'), util.errors.invalid('id')]
    },
    action: getByIdAction
};
var getByIdBookContext = {
    spec: {
        path: '/books/{bid}/releases/{id}',
        notes: '',
        summary: 'Get Book Release by id',
        method: 'GET',
        type: 'Release',
        nickname: 'getBookReleaseById',
        produces: ['application/json'],
        parameters: [
            util.params.id,
            util.params.expand,
            util.params.fields,
            {
                name: 'bid',
                description: 'Book ID',
                paramType: 'path',
                dataType: 'integer',
                required: true
            }
        ],
        responseMessages: [util.errors.notFound('Release'), util.errors.invalid('id')]
    },
    action: getByIdAction
};
var getByIdBook = {
    spec: {
        path: '/releases/{id}/book',
        notes: 'Returns the book for a release',
        summary: 'Get a releases book by release id',
        method: 'GET',
        type: 'Book',
        nickname: 'getReleaseBookById',
        produces: ['application/json'],
        parameters: [util.params.id, util.params.expand, util.params.fields],
        responseMessages: [util.errors.notFound('Release'), util.errors.invalid('id')]
    },
    /**
     * Retrieve the releases book
     * @param {object} req - The Request object.
     * @param {object} res - The Response object.
     */
    action: function (req, res) {
        "use strict";
        if (!req.params.id) {
            util.errors.invalid('id', res);
        } else {
            db.Release.find({
                where: {
                    id: req.params.id
                },
                include: util.parseExpand(((req.query.expand) ? 'book/' + req.query.expand : 'book'), db, ['book', 'book/release'])
            }).then(function (release) {
                if (release) {
                    res.json(release.book);
                } else {
                    util.errors.notFound('Release', res);
                }
            });
        }
    }
};

var create = {
    spec: {
        path: '/releases',
        notes: 'Create a release given release data.',
        summary: 'Create Release',
        method: 'POST',
        type: 'Release',
        nickname: 'createRelease',
        produces: ['application/json'],
        parameters: [
            util.params.Release,
            util.params.fields
        ],
        responseMessages: [util.errors.invalid('Release'), util.errors.conflict('Release')]
    },
    /**
     * Create a release
     * @param {object} req - The Request object.
     * @param {object} res - The Response object.
     */
    action: function (req, res) {
        "use strict";
        if (!req.body.guid) {
            util.error.invalid('Release', res);
        } else {
            db.Release.findOrCreate({
                guid: req.body.guid
            }, req.body).spread(function (release) {
                if (release) {
                    res.json(201, release);
                } else {
                    util.error.conflict('Release', res);
                }
            });
        }
    }
};
/**
 * Update a release given its id
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 */
var updateByIdAction = function (req, res) {
    "use strict";
    if (!req.params.id) {
        util.errors.invalid('id', res);
    } else {
        db.Release.find({
            where: {
                id: req.params.id
            },
            include: util.parseExpand(req.query.expand, db, ['book'])
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
                    util.errors.notFound('Release', res);
                }
            });
    }
};
var updateById = {
    spec: {
        path: '/releases/{id}',
        notes: 'Update a release given its id.',
        summary: 'Update Release',
        method: 'PUT',
        type: 'Release',
        nickname: 'updateRelease',
        produces: ['application/json'],
        parameters: [
            {
                name: 'releaseStatus',
                description: 'Release Status as JSON. {"status": "someStatus"}',
                paramType: 'body',
                dataType: 'object',
                required: true
            },
            util.params.id,
            util.params.expand,
            util.params.fields
        ],
        responseMessages: [
            util.errors.invalid('Release'),
            util.errors.notFound('Release'),
            util.errors.invalid('id')
        ]
    },
    action: updateByIdAction
};
var updateByIdBookContext = {
    spec: {
        path: '/books/{bid}/releases/{id}',
        notes: 'Update a book release given its id.',
        summary: 'Update Book Release',
        method: 'PUT',
        type: 'Release',
        nickname: 'updateBookRelease',
        produces: ['application/json'],
        parameters: [
            {
                name: 'releaseStatus',
                description: 'Release Status as JSON. {"status": "someStatus"}',
                paramType: 'body',
                dataType: 'object',
                required: true
            },
            util.params.id,
            util.params.expand,
            util.params.fields,
            {
                name: 'bid',
                description: 'Book ID',
                paramType: 'path',
                dataType: 'integer',
                required: true
            }
        ],
        responseMessages: [
            util.errors.invalid('Release'),
            util.errors.notFound('Release'),
            util.errors.invalid('id')
        ]
    },
    action: updateByIdAction
};
var update = {
    spec: {
        path: '/releases',
        notes: 'Update multiple releases given a list of release data.',
        summary: 'Update Multiple Releases',
        method: 'PUT',
        type: 'array',
        items: {
            $ref: 'Release'
        },
        nickname: 'updateReleases',
        produces: ['application/json'],
        parameters: [
            {
                name: 'ReleaseList',
                description: 'List of Release data to update. Include id and status.',
                paramType: 'body',
                dataType: 'array',
                items: {
                    $ref: 'Release'
                },
                required: true
            },
            util.params.expand,
            util.params.fields
        ],
        responseMessages: [
            util.errors.invalid('ReleaseList')
        ]
    },
    /**
     * Update a release given its data, may be multiple
     * @param {object} req - The Request object.
     * @param {object} res - The Response object.
     */
    action: function (req, res) {
        "use strict";

        if (_.isArray(req.body)) {
            Q.all(req.body.map(function (release) {
                return db.Release.find({
                    where: {
                        id: release.id
                    },
                    include: util.parseExpand(req.query.expand, db, ['book'])
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
                    util.errors.invalid('ReleaseList', res);
                }
            });
        } else {
            util.errors.invalid('ReleaseList', res);
        }
    }
};
/**
 * Remove a release given its id
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 */
var removeByIdAction = function (req, res) {
    "use strict";
    if (!req.params.id) {
        util.errors.invalid('id', res);
    } else {
        db.Release.find(req.params.id).then(function (release) {
            if (release) {
                release.destroy().then(function () {
                    res.send(204);
                });
            } else {
                util.errors.notFound('Release', res);
            }
        });
    }
};

var removeById = {
    spec: {
        path: '/releases/{id}',
        notes: '',
        summary: 'Remove an existing release',
        method: 'DELETE',
        nickname: 'removeRelease',
        parameters: [
            util.params.id
        ],
        responseMessages: [
            util.errors.invalid('id'),
            util.errors.notFound('Release')
        ]
    },
    action: removeByIdAction
};

var removeByIdBookContext = {
    spec: {
        path: '/books/{bid}/releases/{id}',
        notes: '',
        summary: 'Remove an books\'s existing release',
        method: 'DELETE',
        nickname: 'removeBookRelease',
        parameters: [
            util.params.id,
            {
                name: 'bid',
                description: 'Book ID',
                paramType: 'path',
                dataType: 'integer',
                required: true
            }
        ],
        responseMessages: [
            util.errors.invalid('id'),
            util.errors.notFound('Release')
        ]
    },
    action: removeByIdAction
};

var remove = {
    spec: {
        path: '/releases',
        notes: '',
        summary: 'Remove multiple releases given a list of ids.',
        method: 'DELETE',
        nickname: 'removeMultipleReleases',
        parameters: [
            {
                name: 'ReleaseList',
                description: 'List of Release data to remove. Include id.',
                paramType: 'body',
                dataType: 'array',
                items: {
                    $ref: 'Release'
                },
                required: true
            }
        ],
        responseMessages: [
            util.errors.invalid('ReleaseList')
        ]
    },
    /**
     * Remove one or more releases in a array
     * @param {object} req - The Request object.
     * @param {object} res - The Response object.
     */
    action: function (req, res) {
        "use strict";
        db.Release.destroy(req.body).then(function () {
            res.send(204);
        }, function () {
            util.errors.invalid('ReleaseList', res);
        });
    }
};


function setup (app, swagger) {
    "use strict";
    swagger.addGet(getAll);
    swagger.addGet(getById);
    swagger.addGet(getByIdBookContext);
    swagger.addGet(getByIdBook);
    swagger.addPost(create);
    swagger.addPut(updateById);
    swagger.addPut(updateByIdBookContext);
    swagger.addPut(update);
    swagger.addDelete(removeById);
    swagger.addDelete(removeByIdBookContext);
    swagger.addDelete(remove);
}
module.exports.setup = setup;