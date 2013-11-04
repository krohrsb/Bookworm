/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/14/13 2:35 PM
 * @module schedule
 */

// Dependencies
var events = require('events');
var util = require('util');
var schedule = require('node-schedule');
var _ = require('lodash');
var Q = require('q');

// Local Dependencies
var settingService = require('../setting');
var logger = require('../log').logger();

/**
 * Schedule Service -- To Schedule jobs
 * @constructor
 * @alias module:schedule
 */
var ScheduleService = function () {
    "use strict";
    this._jobs = {};

    // Watch for setting 'sets' so we can update jobs accordingly.
    settingService.on('set', function (key) {
        this.updateJobs(key);
    }.bind(this));

    events.EventEmitter.call(this);
};

util.inherits(ScheduleService, events.EventEmitter);

/**
 * Schedule a Job
 * @param {object} definition - Job definition, has name, action, spec
 * @returns {Promise} A promise of type Promise<Job, Error>
 */
ScheduleService.prototype.scheduleJob = function (definition) {
    'use strict';
    var deferred = Q.defer();
    definition = definition || {};

    var job, spec;

    if (definition.name in this._jobs) {
        this._jobs[definition.name].cancel();
        delete this._jobs[definition.name];
    }
    if (definition.name && definition.action && definition.spec) {
        job = new schedule.Job(definition.name, definition.action);
        job.definition = definition;

        if (typeof definition.spec === 'function') {
            spec = definition.spec();
        } else {
            spec = definition.spec;
        }
        logger.trace('Scheduling job', spec);

        job.schedule(spec);

        this._jobs[definition.name] = job;
        deferred.resolve(job);
    } else {
        deferred.reject(new Error('Job Definition not valid'));
    }
    return deferred.promise;

};

/**
 * Update jobs (refresh their spec) based on an update key.
 * @param {string} updateKey - The setting key assocaited with the job
 */
ScheduleService.prototype.updateJobs = function (updateKey) {
    "use strict";

    _.forEach(this._jobs, function (value, key) {
        var job;
        if (value && value.definition.settingsKey == updateKey) {
            job = this._jobs[key];
            this.scheduleJob(job.definition, function (err, job) {
                if (err) {
                    logger.error(err);
                } else {
                    logger.debug('Rescheduled %s job -- interval changed', job.name);
                }
            });
        }
    }.bind(this));
};

module.exports = ScheduleService;