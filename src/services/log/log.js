/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/14/13 9:50 AM
 * @module log
 */
// Dependencies
var events = require('events');
var util = require('util');
var fs = require('fs-extra');
var winston = require('winston');
var revalidator = require('revalidator');
var _ = require('lodash');
var lineReader = require('line-reader');
var path = require('path');
var find = require('findit');
var Q = require('q');

/**
 * Log Service
 * Provides access to the logger, log querying and detecting current log file.
 * @param {object} settingsService - instance of a settings service for #get
 * @constructor
 * @alias module:log
 */
var LogService = function (settingsService) {
    "use strict";
    this._settingsService = settingsService;
    this._logLevelsArray = [];
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
    var defaults;

    defaults = this._getDefaults();
    // create log file if it doesn't already exist
    fs.createFileSync(path.join(this._settingsService.get('loggers:file:path')));

    //add colors
    winston.addColors(defaults.colors);

    //create the logger
    this._logger = new winston.Logger({
        transports: [
            new winston.transports.Console(defaults.transports.console),
            new winston.transports.File(defaults.transports.file)
        ]
    });

    this._logger.setLevels(defaults.levels);
    this._logLevelsArray = [];
    Object.keys(defaults.levels).forEach(function (key) {
        this._logLevelsArray.push(key);
    }.bind(this));
};

/**
 * Retrieve log defaults
 * @returns {object}
 * @private
 */
LogService.prototype._getDefaults = function () {
    "use strict";
    return {
        levels: {
            trace: 0,
            debug: 1,
            info: 2,
            warn: 3,
            error: 4
        },
        colors: {
            trace: 'grey',
            debug: 'green',
            info: 'cyan',
            warn: 'yellow',
            error: 'red'
        },
        transports: {
            console: {
                colorize: true,
                timestamp: true,
                level: this._settingsService.get('loggers:console:level'),
                silent: !this._settingsService.get('loggers:console:enabled'),
                prettyPrint: true
            },
            file: {
                filename: this._settingsService.get('loggers:file:path'),
                timestamp: true,
                level: this._settingsService.get('loggers:file:level'),
                silent: !this._settingsService.get('loggers:file:enabled'),
                maxsize: this._settingsService.get('loggers:file:maxSize'),
                maxFiles: this._settingsService.get('loggers:file:maxFiles')
            }
        }

    };
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
 * Retrieve the current log file by detecting which one was modified most recently.
 * @returns {Promise} A promise of type Promise<String, Error>
 */
LogService.prototype.getLogFile = function () {
    "use strict";
    var logDirectory, finder, logFiles, deferred;

    deferred = Q.defer();

    /** @type {object[]}**/
    logFiles = [];
    /** @type {string} **/
    logDirectory = path.dirname(path.join(this._settingsService.get('environment:baseDirectory'), this._settingsService.get('loggers:file:path')));

    finder = find(logDirectory);

    // process each file
    finder.on('file', function (file, stat) {
        // if it is a logfile, add details
        if (path.extname(file) === '.log') {
            logFiles.push({
                file: file,
                modifiedTime: stat.mtime.getTime()
            });
        }
    });
    // on read end
    finder.on('end', function () {
        var recentSort;
        // if we have any log files
        if (logFiles.length) {
            // sort log files by timestamp to get most recent
            recentSort = _.sortBy(logFiles, function (result) {
                return result.modifiedTime;
            });
            deferred.resolve(_.last(recentSort).file);
        } else {
            deferred.reject(new Error('Unable to locate log file. ' + logDirectory));
        }
    });

    return deferred.promise;
};

/**
 * Query the log service for logs on the filesystem.
 * @param {object} options - query options object, pass in
 * @returns {Promise} A promise of type Promise<Object, Error>
 */
LogService.prototype.query = function (options) {
    "use strict";
    var defaults, settings, validateResult, unparsedLogs, parsedLogs, logs, levels;
    logs = [];
    unparsedLogs = 0;
    parsedLogs = 0;
    levels = this._logger.levels;
    // set up defaults
    defaults = {
        offset: 0,
        limit: 10,
        minLevel: this._logLevelsArray[1]
    };
    // extend defaults and options
    settings = _.merge({}, defaults, options || {});

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
            },
            minLevel: {
                description: 'The log query minimum log level',
                type: 'string',
                required: true,
                enum: this._logLevelsArray
            }
        }
    });

    if (validateResult.valid) {

        // get the current log file, use it to read the log
        return this.getLogFile().then(function (logFile) {
            var totalLines, log, deferred;
            deferred = Q.defer();
            totalLines = 0;
            lineReader.eachLine(logFile, function (line) {
                totalLines = totalLines + 1;
                if (totalLines >= settings.offset) {
                    try {
                        log = JSON.parse(line);
                        parsedLogs = parsedLogs + 1;
                        //if line parsed correctly
                        if (log && logs.length < settings.limit) {
                            //if the message level is greater or equal to the level that is being requested, add it to the response.
                            if (levels[log.level] >= levels[settings.minLevel]) {
                                logs.push(log);
                            }
                        }
                    } catch (e) {
                        unparsedLogs = unparsedLogs + 1;
                    }
                }
            }).then(function () {
                var response = {
                    data: logs,
                    total: totalLines - unparsedLogs
                };
                deferred.resolve(response);
            });
            return deferred.promise;
        });
    } else {
        return Q.fcall(function () {
            throw new Error(JSON.stringify(validateResult.errors[0]));
        });
    }
};

module.exports = LogService;