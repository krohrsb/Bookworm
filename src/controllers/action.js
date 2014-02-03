/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/23/13 12:19 PM
 */
var actionService = require('../services/action');
var logger = require('../services/log').logger();

//noinspection JSUnusedLocalSymbols
/**
 * Perform an action on a specific author
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function performAuthorAction (req, res, next) {
    "use strict";
    actionService.performAuthorAction(req.body.action, req.params.id).fail(function (err) {
        logger.log('error', err.message, err.stack);
    });
    res.send(204);
}

//noinspection JSUnusedLocalSymbols
/**
 * Perform an action on authors in general
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function performAuthorsAction (req, res, next) {
    "use strict";

    actionService.performGeneralAction(req.body.action).fail(function (err) {
        logger.log('error', err.message, err.stack);
    });
    res.send(204);
}

//noinspection JSUnusedLocalSymbols
/**
 * Perform an action in general
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function performGeneralAction (req, res, next) {
    "use strict";

    actionService.performGeneralAction(req.body.action).fail(function (err) {
        logger.log('error', err.message, err.stack);
    });
    res.send(204);
}

//noinspection JSUnusedLocalSymbols
/**
 * Retrieve a list of actions
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function getActions (req, res, next) {
    "use strict";

    actionService.getActions().then(function (actions) {
        res.json(actions);
    }, next);
}

function setup (app) {
    "use strict";
    app.get('/api/v1/actions', app.passport.authenticate('localapikey'), getActions);
    app.post('/api/v1/actions/authors/:id', app.passport.authenticate('localapikey'), performAuthorAction);
    app.post('/api/v1/actions/authors', app.passport.authenticate('localapikey'), performAuthorsAction);
    app.post('/api/v1/actions/general', app.passport.authenticate('localapikey'), performGeneralAction);
}

module.exports.setup = setup;
