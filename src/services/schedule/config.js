/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/15/13 8:45 AM
 * @module schedule/config
 */
var util = require('util');
var logger = require('../log').logger();
var later = require('later');
var settingService = require('../setting');
var postProcessService = require('../post-process');
var libraryService = require('../library');
var moment = require('moment');

function parseTimeUnit (unit, value) {
    "use strict";
    var duration, sched;
    sched = null;
    duration = moment.duration(value, unit);

    [{unit: 'dayOfMonth', type: 'days'}, {unit: 'hour', type: 'hours'}, {unit: 'minute', type: 'minutes'}, {unit: 'second', type: 'seconds'}].forEach(function (unit) {
        if (!sched && typeof duration[unit.type] === 'function' && duration[unit.type]() > 0) {
            sched = later.parse.recur().every(duration[unit.type]())[unit.unit]();
        }
    });
    return sched;
}
module.exports = [{
    name: 'Post Process',
    action: function () {
        "use strict";
        return postProcessService.process();
    },
    schedule: function (value) {
        "use strict";
        return parseTimeUnit('minutes', value);
    },
    settingsKey: 'postProcessor:frequency'
}, {
    name: 'Search Wanted Books',
    action: function () {
        "use strict";
        return libraryService.findAndDownloadWantedBooks();
    },
    schedule: function (value) {
        "use strict";
        return parseTimeUnit('minutes', value);
    },
    settingsKey: 'searchers:newznab:frequency'
}];