/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/14/13 2:35 PM
 */

// Dependencies
var Q = require('q');

// Local Dependencies
var ScheduleService = require('./schedule').ScheduleService;
var ScheduleJob = require('./schedule').ScheduleJob;
var scheduleService = new ScheduleService();
var logger = require('../log');
var jobConfigs = require('./config');

Q.all(jobConfigs.map(function (jobConfig) {
    "use strict";
    var job;
    job = new ScheduleJob(jobConfig);
    return scheduleService.scheduleJob(job).then(function (job) {
        job.getNextOccurrence().then(function (nextOccurrence) {
            logger.log('info', 'Scheduled Job', {job: job.name, nextOccurrence: nextOccurrence.toString()});
        });
        return job;
    });
})).then(function (jobs) {
    "use strict";
    logger.log('debug', 'Scheduled Jobs', {count: jobs.length});
}, function (err) {
    "use strict";
    logger.log('error', err.message, err.stack);
    throw err;
});

module.exports = scheduleService;
