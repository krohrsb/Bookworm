/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/14/13 9:53 AM
 */
var settingsService = require('../setting');

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
            level: settingsService.get('loggers:console:level'),
            silent: !settingsService.get('loggers:console:enabled'),
            prettyPrint: true
        },
        file: {
            filename: settingsService.get('loggers:file:path'),
            timestamp: true,
            level: settingsService.get('loggers:file:level'),
            silent: !settingsService.get('loggers:file:enabled'),
            maxsize: settingsService.get('loggers:file:maxSize'),
            maxFiles: settingsService.get('loggers:file:maxFiles')
        }
    }
};