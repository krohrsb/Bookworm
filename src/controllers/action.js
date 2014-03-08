/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/23/13 12:19 PM
 */

// Dependencies
var swagger = require('swagger-node-express');
var _ = require('lodash');
// Local Dependencies
var logger = require('../services/log');
var actionService = require('../services/action');
var util = require('../config/routes/util');


var performAuthorAction = {
    spec: {
        path: '/actions/authors/{id}',
        notes: 'Performs an action on an author',
        summary: 'Author Action',
        method: 'POST',
        nickname: 'authorAction',
        produces: ['application/json'],
        parameters: [
            util.params.id,
            {
                name: 'Action',
                description: 'action data',
                paramType: 'body',
                dataType: 'object',
                required: true
            }

        ],
        responseMessages: [util.errors.invalid('Action'), util.errors.invalid('id')]
    },
    /**
     * Perform an action on a specific author
     * @param {object} req - The Request object.
     * @param {object} res - The Response object.
     */
    action: function (req, res) {
        "use strict";
        if (!req.params.id) {
            util.errors.invalid('id', res);
        } else if (!req.body.action) {
            util.errors.invalid('Action', res);
        } else {
            actionService.performAuthorAction(req.body.action, req.params.id).fail(function (err) {
                logger.log('error', err.message, err.stack);
            });
            res.send(204);
        }

    }
};

var performAuthorsAction = {
    spec: {
        path: '/actions/authors',
        notes: 'Performs an action on authors as a whole.',
        summary: 'Authors Action',
        method: 'POST',
        nickname: 'authorsAction',
        produces: ['application/json'],
        parameters: [
            {
                name: 'Action',
                description: 'action data',
                paramType: 'body',
                dataType: 'object',
                required: true
            }

        ],
        responseMessages: [util.errors.invalid('Action')]
    },
    /**
     * Perform an action on authors in general
     * @param {object} req - The Request object.
     * @param {object} res - The Response object.
     */
    action: function (req, res) {
        "use strict";
        if (!req.body.action) {
            util.errors.invalid('Action', res);
        } else {
            actionService.performGeneralAction(req.body.action).fail(function (err) {
                logger.log('error', err.message, err.stack);
            });
            res.send(204);
        }
    }
};

var performGeneralAction = {
    spec: {
        path: '/actions/general',
        notes: 'Performs a general bookworm action',
        summary: 'General Action',
        method: 'POST',
        nickname: 'generalAction',
        produces: ['application/json'],
        parameters: [
            {
                name: 'Action',
                description: 'action data',
                paramType: 'body',
                dataType: 'object',
                required: true
            }

        ],
        responseMessages: [util.errors.invalid('Action')]
    },
    /**
     * Perform an action in general
     * @param {object} req - The Request object.
     * @param {object} res - The Response object.
     */
    action: function (req, res) {
        "use strict";
        if (!req.body.action) {
            util.errors.invalid('Action', res);
        } else {
            actionService.performGeneralAction(req.body.action).fail(function (err) {
                logger.log('error', err.message, err.stack);
            });
            res.send(204);
        }
    }
};

var getActions = {
    spec: {
        path: '/actions',
        notes: 'Gets available actions',
        summary: 'Get Available Actions',
        method: 'GET',
        nickname: 'getActions',
        produces: ['application/json']
    },
    /**
     * Retrieve a list of actions
     * @param {object} req - The Request object.
     * @param {object} res - The Response object.
     */
    action: function (req, res) {
        "use strict";

        actionService.getActions().then(function (actions) {
            res.json(actions);
        });
    }
};


function setup (app, swagger) {
    "use strict";
    swagger.addGet(getActions);
    swagger.addPost(performAuthorAction);
    swagger.addPost(performAuthorsAction);
    swagger.addPost(performGeneralAction);
}

module.exports.setup = setup;
