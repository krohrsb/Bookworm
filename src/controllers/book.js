/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/17/13 12:46 PM
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
        path: '/books',
        notes: 'Returns a list of all books.',
        summary: 'Get All Books',
        method: 'GET',
        type : 'array',
        items: {
            $ref: 'Book'
        },
        nickname: 'getAllBooks',
        produces: ['application/json'],
        parameters: [
            util.params.offset,
            util.params.limit,
            util.params.sort,
            util.params.direction,
            util.params.expand,
            {
                name: 'status',
                description: 'Show only books included in this list of statuses. Comma separated.',
                paramType: 'query',
                dataType: 'string',
                required: false
            },
            util.params.fields
        ]
    },
    //noinspection JSUnusedLocalSymbols
    /**
     * Retrieve all books
     * Supports expand and fields to alter the response.
     * @param {object} req - The Request object.
     * @param {object} res - The Response object.
     * @param {function} next - callback to next middleware
     */
    action: function (req, res, next) {
        'use strict';
        var options = {
            include: util.parseExpand(req.query.expand, db, ['author', 'release']),
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
};

//noinspection JSUnusedLocalSymbols
/**
 * Retrieve a book by id
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 */
var getByIdAction = function (req, res) {
    'use strict';
    if (!req.params.id) {
        util.errors.invalid('id', res);
    } else {
        db.Book.find({
            where: {
                id: req.params.id
            },
            include: util.parseExpand(req.query.expand, db, ['author', 'release'])
        }).then(function (book) {
            if (book) {
                res.json(book);
            } else {
                util.errors.notFound('Book', res);
            }
        });
    }

};

var getById = {
    spec: {
        path: '/books/{id}',
        notes: '',
        summary: 'Get Book by id',
        method: 'GET',
        type: 'Book',
        nickname: 'getBookById',
        produces: ['application/json'],
        parameters: [
            util.params.id,
            util.params.expand,
            util.params.fields
        ],
        responseMessages: [util.errors.notFound('Book'), util.errors.invalid('id')]
    },
    action: getByIdAction
};

var getByIdAuthorContext = {
    spec: {
        path: '/authors/{aid}/books/{id}',
        notes: '',
        summary: 'Get Author Book by id',
        method: 'GET',
        type: 'Book',
        nickname: 'getAuthorBookById',
        produces: ['application/json'],
        parameters: [
            util.params.id,
            util.params.expand,
            util.params.fields,
            {
                name: 'aid',
                description: 'Author ID',
                paramType: 'path',
                dataType: 'integer',
                required: true
            }
        ],
        responseMessages: [util.errors.notFound('Book'), util.errors.invalid('id')]
    },
    action: getByIdAction
};
var getByIdAuthor = {
    spec: {
        path: '/books/{id}/author',
        notes: 'Returns the author of a book',
        summary: 'Get a books author by book id',
        method: 'GET',
        type: 'Author',
        nickname: 'getBookAuthorById',
        produces: ['application/json'],
        parameters: [util.params.id, util.params.expand, util.params.fields],
        responseMessages: [util.errors.notFound('Book'), util.errors.invalid('id')]
    },
    //noinspection JSUnusedLocalSymbols
    /**
     * Retrieve the author of a book
     * @param {object} req - The Request object.
     * @param {object} res - The Response object.
     */
    action: function (req, res) {
        "use strict";
        if (!req.params.id) {
            util.errors.invalid('id', res);
        } else {
            db.Book.find({
                where: {
                    id: req.params.id
                },
                include: util.parseExpand(((req.query.expand) ? 'author/' + req.query.expand : 'author'), db, ['author', 'author/book'])
            }).then(function (book) {
                if (book) {
                    res.json(book.author);
                } else {
                    util.errors.notFound('Book', res);
                }
            });
        }

    }
};
var getByIdReleases = {
    spec: {
        path: '/books/{id}/releases',
        notes: 'Returns the releases for a book',
        summary: 'Get a books releases by book id',
        method: 'GET',
        type: 'array',
        items: {
            $ref: 'Release'
        },
        nickname: 'getBookReleasesById',
        produces: ['application/json'],
        parameters: [util.params.id, util.params.expand, util.params.fields],
        responseMessages: [util.errors.notFound('Book'), util.errors.invalid('id')]
    },
    //noinspection JSUnusedLocalSymbols
    /**
     * Retrieve the releases for a book
     * @param {object} req - The Request object.
     * @param {object} res - The Response object.
     */
    action: function (req, res) {
        "use strict";
        if (!req.params.id) {
            util.errors.invalid('id', res);
        } else {
            db.Book.find({
                where: {
                    id: req.params.id
                },
                include: util.parseExpand(((req.query.expand) ? 'release/' + req.query.expand : 'release'), db, ['book', 'book/author', 'book/release'])
            }).then(function (book) {
                if (book) {
                    res.json(book.releases);
                } else {
                    util.errors.notFound('Book', res);
                }
            });
        }

    }
};
var create = {
    spec: {
        path: '/books',
        notes: 'Create a book given book data. Will create author if author does not exist.',
        summary: 'Create Book',
        method: 'POST',
        type: 'Book',
        nickname: 'createBook',
        produces: ['application/json'],
        parameters: [
            util.params.Book,
            util.params.fields
        ],
        responseMessages: [util.errors.invalid('Book'), util.errors.conflict('Book')]
    },
    //noinspection JSUnusedLocalSymbols
    /**
     * Create a book
     * @param {object} req - The Request object.
     * @param {object} res - The Response object.
     */
    action: function (req, res) {
        "use strict";
        if (!req.body.guid) {
            util.errors.invalid('Book', res);
        } else {
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
                    util.errors.conflict('Book', res);
                }
            }, function () {
                util.errors.invalid('Book', res);
            });
        }

    }
};

//noinspection JSUnusedLocalSymbols
/**
 * Update an author given their id
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 */
var updateByIdAction = function (req, res) {
    "use strict";
    if (!req.params.id) {
        util.errors.invalid('id', res);
    } else {
        db.Book.find({
            where: {
                id: req.params.id
            },
            include: util.parseExpand(req.query.expand, db, ['author', 'release'])
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
                    util.errors.notFound('Book', res);
                }
            }, function () {
                util.errors.invalid('Book', res);
            });
    }

};

var updateById = {
    spec: {
        path: '/books/{id}',
        notes: 'Update a book given its id.',
        summary: 'Update Book',
        method: 'PUT',
        type: 'Book',
        nickname: 'updateBook',
        produces: ['application/json'],
        parameters: [
            {
                name: 'bookStatus',
                description: 'Book Status as JSON. {"status": "someStatus"}',
                paramType: 'body',
                dataType: 'object',
                required: true
            },
            util.params.id,
            util.params.expand,
            util.params.fields
        ],
        responseMessages: [
            util.errors.invalid('Book'),
            util.errors.notFound('Book'),
            util.errors.invalid('id')
        ]
    },
    action: updateByIdAction
};

var updateByIdAuthorContext = {
    spec: {
        path: '/authors/{aid}/books/{id}',
        notes: 'Update a book given its author id and book id.',
        summary: 'Update Authors Book',
        method: 'PUT',
        type: 'Book',
        nickname: 'updateAuthorBook',
        produces: ['application/json'],
        parameters: [
            {
                name: 'bookStatus',
                description: 'Book Status as JSON. {"status": "someStatus"}',
                paramType: 'body',
                dataType: 'object',
                required: true
            },
            util.params.id,
            util.params.expand,
            util.params.fields,
            {
                name: 'aid',
                description: 'Author ID',
                paramType: 'path',
                dataType: 'integer',
                required: true
            }
        ],
        responseMessages: [
            util.errors.invalid('Book'),
            util.errors.notFound('Book'),
            util.errors.invalid('id')
        ]
    },
    action: updateByIdAction
};
var update = {
    spec: {
        path: '/books',
        notes: 'Update multiple books given a list of book data.',
        summary: 'Update Multiple Books',
        method: 'PUT',
        type: 'array',
        items: {
            $ref: 'Book'
        },
        nickname: 'updateBooks',
        produces: ['application/json'],
        parameters: [
            {
                name: 'BookList',
                description: 'List of Book data to update. Include id and status.',
                paramType: 'body',
                dataType: 'array',
                items: {
                    $ref: 'Book'
                },
                required: true
            },
            util.params.expand,
            util.params.fields
        ],
        responseMessages: [
            util.errors.invalid('BookList')
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
            Q.all(req.body.map(function (book) {
                return db.Book.find({
                    where: {
                        id: book.id
                    },
                    include: util.parseExpand(req.query.expand, db, ['author', 'release'])
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
                    util.errors.invalid('BookList', res);
                }
            });
        } else {
            util.errors.invalid('BookList', res);
        }
    }
};

//noinspection JSUnusedLocalSymbols
/**
 * Remove a book
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 */
var removeByIdAction = function (req, res) {
    "use strict";
    if (!req.params.id) {
        util.errors.invalid('id', res);
    } else {
        db.Book.find(req.params.id).then(function (book) {
            if (book) {
                book.destroy().then(function () {
                    res.send(204);
                });
            } else {
                util.errors.notFound('Book', res);
            }
        });
    }
};
var removeById = {
    spec: {
        path: '/books/{id}',
        notes: 'It will also remove its releases.',
        summary: 'Remove an existing book',
        method: 'DELETE',
        nickname: 'removeBook',
        parameters: [
            util.params.id
        ],
        responseMessages: [
            util.errors.invalid('id'),
            util.errors.notFound('Book')
        ]
    },
    action: removeByIdAction
};
var removeByIdAuthorContext = {
    spec: {
        path: '/authors/{aid}/books/{id}',
        notes: 'It will also remove its releases.',
        summary: 'Remove an author\'s existing book',
        method: 'DELETE',
        nickname: 'removeAuthorBook',
        parameters: [
            util.params.id,
            {
                name: 'aid',
                description: 'Author ID',
                paramType: 'path',
                dataType: 'integer',
                required: true
            }
        ],
        responseMessages: [
            util.errors.invalid('id'),
            util.errors.notFound('Book')
        ]
    },
    action: removeByIdAction
};
var remove = {
    spec: {
        path: '/books',
        notes: 'It will also remove each book\'s releases.',
        summary: 'Remove multiple books given a list of ids.',
        method: 'DELETE',
        nickname: 'removeMultipleBooks',
        parameters: [
            {
                name: 'Books',
                description: 'List of Book data to remove. Include id.',
                paramType: 'body',
                dataType: 'array',
                items: {
                    $ref: 'Book'
                },
                required: true
            }
        ],
        responseMessages: [
            util.errors.invalid('BookList')
        ]
    },
    //noinspection JSUnusedLocalSymbols
    /**
     * Remove one or more books in an array
     * @param {object} req - The Request object.
     * @param {object} res - The Response object.
     */
    action: function (req, res) {
        "use strict";
        db.Book.destroy(req.body).then(function () {
            res.send(204);
        }, function () {
            util.errors.invalid('BookList', res);
        });
    }
};

function setup (app, swagger) {
    "use strict";
    swagger.addGet(getAll);
    swagger.addGet(getById);
    swagger.addGet(getByIdAuthor);
    swagger.addGet(getByIdReleases);
    swagger.addPost(create);
    swagger.addPut(update);
    swagger.addPut(updateById);
    swagger.addDelete(remove);
    swagger.addDelete(removeById);
    swagger.addDelete(removeByIdAuthorContext);
    swagger.addPut(updateByIdAuthorContext);
    swagger.addGet(getByIdAuthorContext);
}
module.exports.setup = setup;
