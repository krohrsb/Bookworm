/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/16/13 4:20 PM
 */
// Dependencies
var swagger = require('swagger-node-express');
var uuid = require('node-uuid');
var _ = require('lodash');
var Q = require('q');
var Sequelize = require('sequelize');
// Local Dependencies
var logger = require('../services/log');
var db = require('../config/models');
var libraryService = require('../services/library');
var util = require('../config/routes/util');

/**
 * Local Param definitions for the author controller.
 * @type {object}
 */
var localParams = {
    refresh: {
        name: 'refresh',
        description: 'Refresh authors books?',
        paramType: 'query',
        dataType: 'boolean',
        required: false
    },
    newBooks: {
        name: 'newBooks',
        description: 'When refreshing, only check for new books?',
        paramType: 'query',
        dataType: 'boolean',
        required: false
    }
};

var getAll = {
    spec: {
        path: '/authors',
        notes: 'Returns a list of all authors.',
        summary: 'Get All Authors',
        method: 'GET',
        type : 'array',
        items: {
            $ref: 'Author'
        },
        nickname: 'getAllAuthors',
        produces: ['application/json'],
        parameters: [
            util.params.offset,
            util.params.limit,
            util.params.sort,
            util.params.direction,
            util.params.expand
        ],
        responseMessages: [util.errors.unknown()]
    },
    //noinspection JSUnusedLocalSymbols
    /**
     * Retrieve all authors
     * Supports expand and fields to alter the response.
     * @param {object} req - The Request object.
     * @param {object} res - The Response object.
     */
    action: function (req, res) {
        'use strict';
        db.Author.all({
            include: util.parseExpand(req.query.expand, db, ['book']),
            offset: req.query.offset,
            limit: req.query.limit,
            order: (req.query.sort) ? (req.query.sort + ((req.query.direction) ? ' ' + req.query.direction : ' DESC')) : ''
        }).then(res.json.bind(res), function (err) {
            util.errors.database('Author', err, res);
        });
    }
};

var getById = {
    spec: {
        path: '/authors/{id}',
        notes: '',
        summary: 'Get Author by id',
        method: 'GET',
        type: 'Author',
        nickname: 'getAuthorById',
        produces: ['application/json'],
        parameters: [
            util.params.id,
            localParams.refresh,
            localParams.newBooks,
            util.params.expand,
            util.params.fields
        ],
        responseMessages: [util.errors.notFound('Author'), util.errors.invalid('id'), util.errors.unknown()]
    },
    //noinspection JSUnusedLocalSymbols
    /**
     * Retrieve an author by id
     * @param {object} req - The Request object.
     * @param {object} res - The Response object.
     */
    action: function (req, res) {
        'use strict';
        if (!req.params.id) {
            util.errors.invalid('id', res);
        } else {
            db.Author.find({
                where: {
                    id: req.params.id
                },
                include: util.parseExpand(req.query.expand, db, ['book'])
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
            }, function (err) {
                util.errors.database('Author', err, res);
            }).then(function (author) {
                if (author) {
                    res.json(author);
                } else {
                    util.errors.notFound('Author', res);
                }
            });
        }
    }
};

var getByIdBooks = {
    spec: {
        path: '/authors/{id}/books',
        notes: 'Returns the books of an author',
        summary: 'Get authors books by author id',
        method: 'GET',
        type: 'array',
        items: {
            $ref: 'Book'
        },
        nickname: 'getAuthorsBooksById',
        produces: ['application/json'],
        parameters: [util.params.id, util.params.expand, util.params.fields],
        responseMessages: [util.errors.notFound('Author'), util.errors.invalid('id'), util.errors.unknown()]
    },
    //noinspection JSUnusedLocalSymbols
    /**
     * Retrieve an authors books given the author id
     * @param {object} req - The Request object.
     * @param {object} res - The Response object.
     */
    action: function (req, res) {
        "use strict";
        if (!req.params.id) {
            util.errors.invalid('id', res);
        } else {
            db.Author.find({
                where: {
                    id: req.params.id
                },
                include: util.parseExpand(((req.query.expand) ? 'book/' + req.query.expand : 'book'), db, ['book', 'book/release'])
            }, function (err) {
                util.errors.database('Author', err, res);
            }).then(function (author) {
                if (author) {
                    res.json(author.books);
                } else {
                    util.errors.notFound('Author', res);
                }
            });
        }

    }
};

var create = {
    spec: {
        path: '/authors',
        notes: 'Create an author given author data',
        summary: 'Create Author',
        method: 'POST',
        type: 'Author',
        nickname: 'createAuthor',
        produces: ['application/json'],
        parameters: [
            util.params.Author,
            util.params.fields
        ],
        responseMessages: [util.errors.conflict('Author'), util.errors.invalid('Author'), util.errors.unknown()]
    },
    //noinspection JSUnusedLocalSymbols
    /**
     * Create an author
     * @param {object} req - The Request object.
     * @param {object} res - The Response object.
     */
    action: function (req, res, next) {
        "use strict";
        db.Author.create(_.extend(req.body, { guid: uuid.v4()})).then(function (author) {
            res.json(201, author);
        }, function (err) {
            util.errors.database('Author', err, res);
        });
    }
};

var updateById = {
    spec: {
        path: '/authors/{id}',
        notes: 'Update an author given their id.',
        summary: 'Update Author',
        method: 'PUT',
        type: 'Author',
        nickname: 'updateAuthor',
        produces: ['application/json'],
        parameters: [
            {
                name: 'authorStatus',
                description: 'Author Status as JSON. {"status": "someStatus"}',
                paramType: 'body',
                dataType: 'object',
                required: true
            },
            util.params.id,
            util.params.expand,
            util.params.fields
        ],
        responseMessages: [
            util.errors.invalid('Author'),
            util.errors.notFound('Author'),
            util.errors.invalid('id'),
            util.errors.unknown()
        ]
    },
    //noinspection JSUnusedLocalSymbols
    /**
     * Update an author given their id
     * @param {object} req - The Request object.
     * @param {object} res - The Response object.
     */
    action: function (req, res) {
        "use strict";
        if (!req.params.id) {
            util.errors.invalid('id', res);
        } else {
            db.Author.find({
                where: {
                    id: req.params.id
                },
                include: util.parseExpand(req.query.expand, db, ['book'])
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
                    util.errors.notFound('Author', res);
                }
            },function (err) {
                util.errors.database('Author', err, res);
            });
        }

    }
};

var update = {
    spec: {
        path: '/authors',
        notes: 'Update multiple authors given a list of author data.',
        summary: 'Update Multiple Authors',
        method: 'PUT',
        type: 'array',
        items: {
            $ref: 'Author'
        },
        nickname: 'updateAuthors',
        produces: ['application/json'],
        parameters: [
            {
                name: 'Authors',
                description: 'List of Author data to update. Include id and status.',
                paramType: 'body',
                dataType: 'array',
                items: {
                    $ref: 'Author'
                },
                required: true
            },
            util.params.expand,
            util.params.fields
        ],
        responseMessages: [
            util.errors.invalid('AuthorList'),
            util.errors.unknown()
        ]
    },
    //noinspection JSUnusedLocalSymbols
    /**
     * Update an author given their data, may be multiple
     * @param {object} req - The Request object.
     * @param {object} res - The Response object.
     */
    action: function (req, res) {
        "use strict";
        if (_.isArray(req.body)) {
            Q.all(req.body.map(function (author) {
                return db.Author.find({
                    where: {
                        id: author.id
                    },
                    include: util.parseExpand(req.query.expand, db, ['book'])
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
                    util.errors.invalid('AuthorList', res);
                }
            });
        } else {
            util.errors.invalid('AuthorList', res);
        }
    }
};
var removeById = {
    spec: {
        path: '/authors/{id}',
        notes: 'It will also remove their books and each book\'s releases.',
        summary: 'Remove an existing author',
        method: 'DELETE',
        nickname: 'removeAuthor',
        parameters: [
            util.params.id
        ],
        responseMessages: [
            util.errors.invalid('id'),
            util.errors.notFound('Author'),
            util.errors.unknown()
        ]
    },
    //noinspection JSUnusedLocalSymbols
    /**
     * Remove a author given their id - WILL REMOVE THEIR BOOKS
     * @param {object} req - The Request object.
     * @param {object} res - The Response object.
     */
    action: function (req, res) {
        "use strict";
        if (!req.params.id) {
            util.errors.invalid('id', res);
        } else {
            db.Author.find({
                where: {
                    id: req.params.id
                }
            }).then(function (author) {
                if (author) {
                    author.destroy().then(function () {
                        res.send(204);
                    }, function (err) {
                        util.errors.database('Author', err, res);
                    });
                } else {
                    util.errors.notFound('Author', res);
                }
            });
        }

    }
};

var remove = {
    spec: {
        path: '/authors',
        notes: 'It will also remove their books and each book\'s releases.',
        summary: 'Remove multiple authors given a list of ids.',
        method: 'DELETE',
        nickname: 'removeMultipleAuthor',
        parameters: [
            {
                name: 'Authors',
                description: 'List of Author data to remove. Include id.',
                paramType: 'body',
                dataType: 'array',
                items: {
                    $ref: 'Author'
                },
                required: true
            }
        ],
        responseMessages: [
            util.errors.invalid('AuthorList'),
            util.errors.unknown()
        ]
    },
    //noinspection JSUnusedLocalSymbols
    /**
     * Remove one or more authors in an array - WILL REMOVE THEIR BOOKS
     * @param {object} req - The Request object.
     * @param {object} res - The Response object.
     */
    action: function (req, res) {
        "use strict";
        db.Author.destroy(req.body).then(function () {
            res.send(204);
        }, function (err) {
            util.errors.database('AuthorList', err, res);
        });
    }
};


function setup (app, swagger) {
    "use strict";
    swagger.addGet(getAll);
    swagger.addGet(getById);
    swagger.addGet(getByIdBooks);
    swagger.addPost(create);
    swagger.addPut(updateById);
    swagger.addPut(update);
    swagger.addDelete(removeById);
    swagger.addDelete(remove);
}
module.exports.setup = setup;
