/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/14/13 9:53 AM
 */
var settingService = require('../setting');

module.exports = {
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
            level: settingService.get('loggers:console:level'),
            silent: !settingService.get('loggers:console:enabled'),
            prettyPrint: true
        },
        file: {
            filename: settingService.get('loggers:file:path'),
            timestamp: true,
            level: settingService.get('loggers:file:level'),
            silent: !settingService.get('loggers:file:enabled'),
            maxsize: settingService.get('loggers:file:maxSize'),
            maxFiles: settingService.get('loggers:file:maxFiles')
        }
    }
};