/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/14/13 12:52 PM
 * @module command
 */

// Dependencies
var events = require('events');
var util = require('util');

// Local Dependencies
var logger = require('../log').logger();

/**
 * Service to manage commands issued to the application on a generic level.
 * Mainly to be used for the API
 * @constructor
 * @alias module:command
 */
var CommandService = function () {
    "use strict";
    this._commands = ['killProcess', 'forceSearchWantedBooks', 'forcePostProcess', 'backupDatabase'];
    events.EventEmitter.call(this);
};

util.inherits(CommandService, events.EventEmitter);

/**
 * Emit a command with its name
 * @param {string} command - the command to emit
 * @private
 */
CommandService.prototype._emitCommand = function (command) {
    "use strict";
    this.emit('command:' + command);
};

/**
 * Retrieve a list of supported commands;
 * @returns {String[]}
 */
CommandService.prototype.getCommands = function () {
    "use strict";
    return this._commands;
};

/**
 * Checks to see if the service supports a command
 * @param {string} command - the command to check
 * @returns {boolean}
 */
CommandService.prototype.hasCommand = function (command) {
    "use strict";
    return this._commands.indexOf(command) !== -1;
};

/** COMMAND IMPLEMENTATIONS **/

/**
 * Kill the current process.
 */
CommandService.prototype.killProcess = function () {
    "use strict";
    this._emitCommand('killProcess');
    logger.debug('Sending SIGUSR2 to the process', {pid: process.pid});
    process.kill(process.pid, 'SIGUSR2');
};

/**
 * Force a search for all wanted books
 */
CommandService.prototype.forceSearchWantedBooks = function () {
    "use strict";
    this._emitCommand('forceSearchWantedBooks');
    console.log('search wanted books');
};

/**
 * Force a post process
 */
CommandService.prototype.forcePostProcess = function () {
    "use strict";
    this._emitCommand('forcePostProcess');
    console.log('force post process');
};

/**
 * Back up the database
 */
CommandService.prototype.backupDatabase = function () {
    "use strict";
    this._emitCommand('backupDatabase');
    console.log('backupDatabase');
};

module.exports = CommandService;