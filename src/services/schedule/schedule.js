/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/14/13 2:35 PM
 * @module schedule
 */

// Dependencies
var events = require('events');
var util = require('util');
var later = require('later');
var _ = require('lodash');
var Q = require('q');

// Local Dependencies
var settingService = require('../setting');
var logger = require('../log').logger();

/**
 * Schedule Job, holds data for a scheduled job.
 * @param {object} config - the job config
 * @constructor
 */
var ScheduleJob = function (config) {
    "use strict";
    this.config = config;
    this.name = config.name;
    this.action = config.action;
    this.settingsKey = config.settingsKey;

    if (typeof config.schedule === 'function') {
        this.scheduleSpec = config.schedule(settingService.get(this.settingsKey));
    } else {
        this.scheduleSpec = config.schedule;
    }

    this.timer = null;

    // Watch for setting 'sets' so we can update jobs accordingly.
    settingService.on('set', function (key) {
        if (key === this.settingsKey) {
            if (typeof this.config.schedule === 'function') {
                this.scheduleSpec = this.config.schedule(settingService.get(key));
            } else {
                this.scheduleSpec = this.config.schedule;
            }
            this.schedule().then(function () {
                logger.log('info', 'Job rescheduled', {name: this.name});
            }.bind(this));
        }
    }.bind(this));

    events.EventEmitter.call(this);

};

util.inherits(ScheduleJob, events.EventEmitter);

/**
 * Schedule the job using the schedule spec defined for it.
 * @returns {Promise} A Promise of type Promise<Object, Error>
 */
ScheduleJob.prototype.schedule = function () {
    "use strict";
    return this.clear().then(function () {
        if (this.scheduleSpec) {
            this.timer = later.setInterval(this._getAction(this.action), this.scheduleSpec);
            this.getNextOccurrence().then(function (occurence) {
                this.emit('schedule', this, occurence);
            }.bind(this));

            return this.timer;
        } else {
            logger.log('warn', 'Job not scheduled as specified duration is invalid', {job: this.name});
            return null;
        }

    }.bind(this));
};

/**
 * Clear the scheduled job
 * @returns {Promise} A Promise of type Promise<,Error>
 */
ScheduleJob.prototype.clear = function () {
    "use strict";
    if (this.timer) {
        this.timer.clear();
    }
    this.emit('clear');
    return Q();
};

/**
 * Creates a wrapper function for the action for logging/error handling.
 * @param {function} action - The action function.
 * @returns {function} - The wrapped function
 * @private
 */
ScheduleJob.prototype._getAction = function (action) {
    "use strict";
    return function () {
        logger.log('info', 'Executing Job', {name: this.name});
        return action().then(function () {

            this.getNextOccurrence().then(function (occurrence) {
                this.emit('occurrence', this, occurrence);
                logger.log('info', 'Job finished', {name: this.name, nextOccurrence: occurrence.toString()});
            }.bind(this));
        }.bind(this), function (err) {
            logger.log('warn', 'Job finished with error', {name: this.name});
            logger.log('error', err.message, err.stack);
        }.bind(this));
    }.bind(this);
};

/**
 * Retrieve the next occurrence of this scheduled job.
 * @returns {Promise} A Promise of type Promise<String, Error>
 */
ScheduleJob.prototype.getNextOccurrence = function () {
    "use strict";
    var next;
    if (this.scheduleSpec) {
        next = later.schedule(this.scheduleSpec).next();
        this.emit('next', next);
        return Q(next);
    } else {
        logger.log('warn', 'Could not calculate next occurrence for job, schedule specification invalid', {job: this.name});
        return Q(null);
    }

};


/**
 * Schedule service to hold a collection of schedules.
 * @constructor
 */
var ScheduleService = function () {
    "use strict";
    this._jobs = [];
    events.EventEmitter.call(this);
};

util.inherits(ScheduleService, events.EventEmitter);


/**
 * Schedule a job
 * @param {ScheduleJob} job - The job to schedule
 * @returns {Promise} A Promise of type Promise<ScheduleJob, Error>
 */
ScheduleService.prototype.scheduleJob = function (job) {
    "use strict";
    var deferred = Q.defer();

    if (job) {
        job.on('schedule', function (job, next) {
            this.emit('job:schedule', job, next);
        }.bind(this));
        job.on('occurrence', function (job, next) {
            this.emit('job:occurrence', job, next);
        }.bind(this));
        job.schedule();
        this._jobs.push(job);
        deferred.resolve(job);
    } else {
        deferred.reject(new Error('Job not defined'));
    }
    return deferred.promise;
};

/**
 * Retrieve a job by name
 * @param {string} name - The name of the job
 * @returns {Promise} A Promise of type Promise<Job|undefined, Error>
 */
ScheduleService.prototype.getJob = function (name) {
    "use strict";
    return Q(_.find(this._jobs, function (job) {
        return job.name === name;
    }));
};

/**
 * Get all jobs
 * @returns {Promise} A Promise of type Promise<ScheduleJob[], Error>
 */
ScheduleService.prototype.getJobs = function () {
    "use strict";
    return Q(this._jobs);
};

module.exports = {
    ScheduleJob: ScheduleJob,
    ScheduleService: ScheduleService
};