/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/14/13 2:35 PM
 */

// Dependencies
var Q = require('q');

// Local Dependencies
var ScheduleService = require('./schedule');
var scheduleService = new ScheduleService();
var logger = require('../log').logger();
var jobDefinitions = require('./config');


Q.all(jobDefinitions.map(function (jobDefinition) {
    "use strict";
    logger.debug('Scheduling %s job', jobDefinition.name);
    return scheduleService.scheduleJob(jobDefinition);
}))
.then(function (jobs) {
    "use strict";
    logger.debug('Scheduled %s jobs', jobs.length);
}, function (err) {
    "use strict";
    logger.error(err);
    throw err;
});

module.exports = scheduleService;
