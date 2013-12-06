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
var logger = require('../log').logger();
var jobConfigs = require('./config');

Q.all(jobConfigs.map(function (jobConfig) {
    "use strict";
    var job;
    job = new ScheduleJob(jobConfig);
    return scheduleService.scheduleJob(job);
})).then(function (jobs) {
    "use strict";
    logger.debug('Scheduled %s jobs', jobs.length);
}, function (err) {
    "use strict";
    logger.err(err);
    throw err;
});

module.exports = scheduleService;
