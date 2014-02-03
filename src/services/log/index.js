/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/10/13 4:33 PM
 */
var settingService = require('../setting');
var StatefulSetting = require('../setting/stateful-setting');
var LogService = require('./log');

//create stateful setting object for newznab
var logSettings = new StatefulSetting({
    loggers: {
        console: {
            debug: 'loggers:console:debug',
            enabled: 'loggers:console:enabled'
        },
        file: {
            filename: 'loggers:file:path',
            debug: 'loggers:file:debug',
            enabled: 'loggers:file:enabled',
            maxsize: 'loggers:file:maxSize',
            maxFiles: 'loggers:file:maxFiles'
        }
    }
});

var logService = new LogService(logSettings.get());

logSettings.on('updated', function (options) {
    "use strict";
    logService.updateSettings(options);
});

module.exports = logService;