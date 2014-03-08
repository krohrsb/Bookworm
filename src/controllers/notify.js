/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/16/13 9:14 AM
 */

// Dependencies
var swagger = require('swagger-node-express');
var _ = require('lodash');
// Local Dependencies
var notificationService = require('../services/notify');
var logger = require('../services/log');
var db = require('../config/models');
var util = require('../config/routes/util');


var notify = {
    spec: {
        path: '/notifiers/{name}/notify',
        notes: '',
        summary: 'Test Notify using a notifier',
        method: 'PUT',
        type : 'string',
        nickname: 'notify',
        produces: ['application/json'],
        parameters: [
            {
                name: 'name',
                description: 'Notifier Name',
                paramType: 'path',
                dataType: 'string',
                required: true
            }
        ],
        responseMessages: [util.errors.notFound('Notifier'), util.errors.invalid('name')]
    },
    //noinspection JSUnusedLocalSymbols
    /**
     * Notify a notifier
     * @param {object} req - The Request object.
     * @param {object} res - The Response object.
     */
    action: function (req, res) {
        "use strict";
        var notifier;

        if (!req.params.name) {
            util.errors.invalid('name', res);
        } else {
            notifier = notificationService.getNotifier(req.params.name);

            if (notifier) {
                notifier.notify(null, {title: 'Test Notification'}).then(function (response) {
                    if (response.statusCode) {
                        res.status(parseInt(response.statusCode, 10));
                    }
                    res.json(response);
                });
            } else {
                util.errors.notFound('Notifier', res);
            }
        }
    }
};

var getNotifiers = {
    spec: {
        path: '/notifiers',
        notes: '',
        summary: 'Get a list of notifiers',
        method: 'GET',
        type : 'object',
        nickname: 'getNotifiers',
        produces: ['application/json']
    },
    //noinspection JSUnusedLocalSymbols
    /**
     * @param {object} req - The Request object.
     * @param {object} res - The Response object.
     */
    action: function (req, res) {
        "use strict";
        var notifiers, json;
        notifiers = notificationService.getNotifiers();

        if (_.isArray(notifiers)) {
            json = notifiers.map(function (notifier) {
                return notifier.toJSON();
            });
            res.json(json);
        } else {
            res.json([]);
        }
    }
};

function setup (app, swagger) {
    "use strict";
    swagger.addPut(notify);
    swagger.addGet(getNotifiers);
}
module.exports.setup = setup;
