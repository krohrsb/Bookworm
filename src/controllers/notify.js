/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/16/13 9:14 AM
 */
var _ = require('lodash');

var notificationService = require('../services/notify');

var logger = require('../services/log').logger();

//noinspection JSUnusedLocalSymbols
/**
 * Verify a notifier
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function verify (req, res, next) {
    'use strict';
    var notifier;
    logger.trace('Controllers::notify::verify(%s)', req.params.name);
    notifier = notificationService.getNotifier(req.params.name);

    if (notifier) {
        notifier.verify({}).then(function (response) {
            if (response.statusCode) {
                res.status(parseInt(response.statusCode, 10));
            }
            res.json(response);
        }, next);
    } else {
        res.send(404);
    }
}

//noinspection JSUnusedLocalSymbols
/**
 * Notify a notifier
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function notify (req, res, next) {
    "use strict";
    var notifier;

    logger.trace('Controllers::notify::notify(%s)', req.params.name);
    notifier = notificationService.getNotifier(req.params.name);

    if (notifier) {
        notifier.notify(req.body || {}).then(function (response) {
            if (response.statusCode) {
                res.status(parseInt(response.statusCode, 10));
            }
            res.json(response);
        }, next);
    } else {
        res.send(404);
    }
}

//noinspection JSUnusedLocalSymbols
/**
 * Get a list of notifiers
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function getNotifiers (req, res, next) {
    "use strict";
    var notifiers, json;
    logger.trace('Controllers::notify::getNotifiers');
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
function setup (app) {
    "use strict";
    app.get('/api/v1/notifiers', getNotifiers);
    app.get('/api/v1/notifiers/:name/verify', verify);
    app.put('/api/v1/notifiers/:name/notify', notify);
}
module.exports.setup = setup;
