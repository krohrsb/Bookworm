/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/10/13 4:33 PM
 */

// Local Dependencies
var settingsService = require('../setting');
var loggerDefaults = require('./config');
var LogService = require('./log');


module.exports = new LogService(settingsService, loggerDefaults);