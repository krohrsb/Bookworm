/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/14/13 12:52 PM
 * @module command
 */

// Dependencies
var events = require('events');
var util = require('util');
var _ = require('lodash');
var Q = require('q');

// Local Dependencies
var logger = require('../log').logger();
var postProcessService = require('../post-process');
var libraryService = require('../library');
var authorService = require('../library/author');

/**
 * Service to manage commands issued to the application on a generic level.
 * Mainly to be used for the API
 * @constructor
 * @alias module:command
 */
var ActionService = function () {
    "use strict";
    this._actions = ['refreshAuthorNewBooks', 'refreshAuthor', 'refreshActiveAuthors', 'refreshActiveAuthorsNewBooks', 'findAndDownloadWantedBooks', 'killProcess', 'forcePostProcess'];
    events.EventEmitter.call(this);
};

util.inherits(ActionService, events.EventEmitter);

/**
 * Emit a command with its name
 * @param {string} action - the action to emit
 * @param {boolean} success - the success of the action
 * @private
 */
ActionService.prototype._emitAction = function (action, success) {
    "use strict";
    this.emit('action/' + action, success);
    this.emit('action', action, success);
};

/**
 * Retrieve a list of supported actions;
 * @returns {String[]}
 */
ActionService.prototype.getActions = function () {
    "use strict";
    //noinspection JSHint
    return Q(this._actions);
};


/**
 * Detect if the action service has a given action by name
 * @param {string} action - the name of the action
 * @returns {Promise} A promise of type Promise<Boolean, Error>
 */
ActionService.prototype.hasAction = function (action) {
    "use strict";
    //noinspection JSHint
    return Q(_.contains(this._actions, action));
};

/**
 * Perform an author action
 * @param {string} action - the action to perform
 * @param {string} id - The ID of the author to perform the action on
 * @returns {Promise} A promise of type Promise<*, Error>
 */
ActionService.prototype.performAuthorAction = function (action, id) {
    "use strict";
    return this.hasAction(action).then(function (hasAction) {
        var err;
        if (hasAction) {
            return authorService.find(id).then(function (author) {
                if (action === 'refreshAuthor') {
                    return libraryService.refreshAuthor(author);
                } else if (action === 'refreshAuthorNewBooks') {
                    return libraryService.refreshAuthor(author, {onlyNewBooks: true});
                } else {
                    return null;
                }
            }.bind(this));
        } else {
            err = new Error('Action does not exist');
            err.statusCode = 404;
            throw err;
        }
    }.bind(this));

};

/**
 * Perform a general authors action
 * @param {string} action - The action to perform
 * @returns {Promise} A promise of type Promise<*, Error>
 */
ActionService.prototype.performGeneralAction = function (action) {
    "use strict";

    return this.hasAction(action).then(function (hasAction) {
        var err;
        if (hasAction) {
            logger.debug('Attempting action %s', action);
            if (action === 'refreshActiveAuthors') {
                return libraryService.refreshActiveAuthors(false);
            } else if (action === 'refreshActiveAuthorsNewBooks') {
                return libraryService.refreshActiveAuthors(true);
            } else if (action === 'findAndDownloadWantedBooks') {
                return libraryService.findAndDownloadWantedBooks();
            } else if (action === 'forcePostProcess') {
                return postProcessService.process();
            } else if (action === 'killProcess') {
                logger.debug('Sending SIGUSR2 to the process', {pid: process.pid});
                process.kill(process.pid, 'SIGUSR2');
                return null;
            } else {
                return null;
            }
        } else {
            err = new Error('Action does not exist');
            err.statusCode = 404;
            throw err;
        }
    }.bind(this)).then(function () {
        this._emitAction(action, true);
    }.bind(this), function (err) {
        logger.err(err);
        this._emitAction(action, false);
    }.bind(this));
};

module.exports = ActionService;