/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/16/13 11:08 AM
 */
// Dependencies
var swagger = require('swagger-node-express');
var _ = require('lodash');
// Local Dependencies
var logger = require('../services/log');
var db = require('../config/models');
var util = require('../config/routes/util');
var remoteLibraryService = require('../services/remote-library');
var settingService = require('../services/setting');


var queryBooks = {
    spec: {
        path: '/library/books',
        notes: 'Search remote books',
        summary: 'Search Remote Books (Google Books, for example)',
        method: 'GET',
        type : 'array',
        items: {
            $ref: 'object'
        },
        nickname: 'getRemoteBooks',
        produces: ['application/json'],
        parameters: [
            util.params.fields,
            {
                name: 'startIndex',
                description: 'Paging Start Index',
                paramType: 'query',
                dataType: 'integer',
                required: false
            },
            {
                name: 'maxResults',
                description: 'Maximum Results to return (max 40)',
                paramType: 'query',
                dataType: 'integer',
                required: false
            },
            {
                name: 'orderBy',
                description: 'Order results',
                paramType: 'query',
                dataType: 'string',
                enum: ['relevance', 'newest'],
                required: false
            },
            {
                name: 'q',
                description: 'The query. Uses Google Books syntax.',
                paramType: 'query',
                dataType: 'string',
                required: true
            }

        ]
    },
    /**
     * Queries the remote library
     * @param {object} req - The Request object.
     * @param {object} res - The Response object.
     */
    action: function (req, res) {
    'use strict';
    remoteLibraryService.pagingQuery(_.merge({}, {
        pagingQueryLimit: settingService.get('searchers:googleBooks:pagingLimits:searchBooks')
    }, req.query || {})).then(res.json.bind(res));
}
};

var bookById = {
    spec: {
        path: '/library/books/{id}',
        notes: '',
        summary: 'Get Remote Book by id',
        method: 'GET',
        type: 'Release',
        nickname: 'getRemoteBookById',
        produces: ['application/json'],
        parameters: [
            util.params.id,
            util.params.fields
        ],
        responseMessages: [util.errors.notFound('Book'), util.errors.invalid('id')]
    },
    /**
     * Queries the remote library given an ID
     * @param {object} req - The Request object.
     * @param {object} res - The Response object.
     */
    action: function (req, res) {
        'use strict';
        if (!req.params.id) {
            util.errors.invalid('id', res);
        } else {
            remoteLibraryService.findById(req.params.id, {}).then(function (book) {
                if (book) {
                    res.json(book);
                } else {
                    util.errors.notFound('Book');
                }
            });
        }
    }
};

var queryAuthors = {
    spec: {
        path: '/library/authors',
        notes: 'Search remote books',
        summary: 'Search Remote Books (Google Books, for example)',
        method: 'GET',
        type : 'array',
        items: {
            $ref: 'object'
        },
        nickname: 'getRemoteBooks',
        produces: ['application/json'],
        parameters: [
            util.params.fields,
            {
                name: 'q',
                description: 'Author name, query.',
                paramType: 'query',
                dataType: 'string',
                required: true
            }

        ]
    },
    /**
     * Queries the remote library and returns a list of authors with a relevance rating.
     * @param {object} req - The Request object.
     * @param {object} res - The Response object.
     */
    action: function (req, res) {
    "use strict";
    remoteLibraryService.queryAuthors(_.merge({}, {
        pagingQueryLimit: settingService.get('searchers:googleBooks:pagingLimits:searchAuthors')
    }, req.query || {})).then(res.json.bind(res));
}
};


function setup (app, swagger) {
    "use strict";
    swagger.addGet(queryAuthors);
    swagger.addGet(queryBooks);
    swagger.addGet(bookById);
}
module.exports.setup = setup;
