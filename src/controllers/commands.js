/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/11/13 5:15 PM
 */
var commandService = require('../services/command');

//noinspection JSUnusedLocalSymbols
/**
 * Issue a command
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function command (req, res, next) {
    "use strict";
    if (req.params.command && commandService.hasCommand(req.params.command)) {
        commandService[req.params.command]();
        res.send(200);
    }
}

//noinspection JSUnusedLocalSymbols
/**
 * Get a list of commands
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function commands (req, res, next) {
    'use strict';

    res.json(commandService.getCommands());
}

/**
 * Set up the routes
 * @param {object} app - reference to express application.
 */
function setup (app) {
    "use strict";
    app.get('/api/v1/commands', commands);
    app.post('/api/v1/commands/:command', command);
}

module.exports.setup = setup;