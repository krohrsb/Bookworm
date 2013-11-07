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

module.exports = [{
    name: 'Post Process',
    action: function () {
        "use strict";
        return postProcessService.process();
    },
    schedule: function (value) {
        "use strict";
        return later.parse.recur().every(value).minute();
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
        return later.parse.recur().every(value).minute();
    },
    settingsKey: 'searchers:newznab:frequency'
}];