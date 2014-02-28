/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/14/13 9:50 AM
 * @module log
 */
// Dependencies
var events = require('events');
var util = require('util');
var fs = require('fs-extra');
var es = require('event-stream');
var Logger = require('caterpillar').Logger;
var filter = require('caterpillar-filter');
var human = require('caterpillar-human');
var revalidator = require('revalidator');
var _ = require('lodash');
var lineReader = require('line-reader');
var path = require('path');
var find = require('findit');
var Q = require('q');

// Local Dependencies
var defaultConfig = require('./config');

/**
 * Log Service
 * Provides access to the logger, log querying and detecting current log file.
 * @param {object} options - options
 * @constructor
 * @alias module:log
 */
var LogService = function (options) {
    "use strict";
    this._defaults = defaultConfig || {};
    this._settings = _.merge({}, this._defaults, options || {});
    this._logger = null;

    this.initialize();

    events.EventEmitter.call(this);
};

util.inherits(LogService, events.EventEmitter);

/**
 * Initialize the Log Service
 * Can be called multiple times
 */
LogService.prototype.initialize = function () {
    "use strict";
    var logFilter, logHuman;

    logHuman = human.createHuman();
    //create the logger
    this._logger = new Logger(this._settings.config);

    if (this._settings.loggers.console.enabled) {
        logFilter = filter.createFilter({level: (this._settings.loggers.console.debug ? 7 : 6)});
        this._logger.pipe(logFilter).pipe(logHuman).pipe(process.stdout);
    }

    if (this._settings.loggers.file.enabled) {

        if (!fs.existsSync(path.dirname(this._settings.loggers.file.filename))) {
            fs.mkdirSync(path.dirname(this._settings.loggers.file.filename));
        }

        logFilter = filter.createFilter({level: (this._settings.loggers.file.debug ? 7 : 6)});
        this._logger.pipe(logFilter).pipe(es.join('\n')).pipe(fs.createWriteStream(this._settings.loggers.file.filename, {flags: 'a'}));
    }
};

/**
 * Update the instance settings
 * @param {object} options - Updated options object
 */
LogService.prototype.updateSettings = function (options) {
    "use strict";
    this._logger.log('debug', 'updating settings');
    this._settings = _.merge({}, this._defaults, options || {});
    this.initialize();
};

/**
 * Grab the logger instance
 * @return {object} Logger instance (winston)
 */
LogService.prototype.logger = function () {
    "use strict";
    return this._logger;
};

/**
 * Query the log service for logs on the filesystem.
 * @param {object} options - query options object, pass in
 * @returns {Promise} A promise of type Promise<Object, Error>
 */
LogService.prototype.query = function (options) {
    "use strict";
    var defaults, settings, validateResult, unparsedLogs, parsedLogs, logs;
    logs = [];
    unparsedLogs = 0;
    parsedLogs = 0;
    // set up defaults
    defaults = {
        offset: 0,
        limit: 10
    };
    // extend defaults and options
    settings = _.merge({}, defaults, options || {});

    settings.offset = parseInt(settings.offset, 10);
    settings.limit = parseInt(settings.limit, 10);
    validateResult = revalidator.validate(settings, {
        properties: {
            offset: {
                description: 'The log query offset',
                type: 'integer',
                minimum: 0,
                required: true
            },
            limit: {
                description: 'The log query limit',
                type: 'integer',
                minimum: 1,
                required: true
            }
        }
    });

    if (validateResult.valid) {

        // get the current log file, use it to read the log
        var totalLines, log, deferred, logFile;
        logFile = this._settings.loggers.file.filename;
        deferred = Q.defer();
        totalLines = 0;
        lineReader.eachLine(logFile, function (line) {
            totalLines = totalLines + 1;
            try {
                log = JSON.parse(line);
                parsedLogs = parsedLogs + 1;
                logs.push(log);
            } catch (e) {
                unparsedLogs = unparsedLogs + 1;
            }
        }).then(function () {
                var response = {
                    data: logs.reverse().slice(settings.offset, settings.limit + settings.offset),
                    total: totalLines - unparsedLogs
                };
                deferred.resolve(response);
            });
        return deferred.promise;
    } else {
        return Q.fcall(function () {
            throw new Error(JSON.stringify(validateResult.errors[0]));
        });
    }
};

module.exports = LogService;