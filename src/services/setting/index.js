/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/14/13 9:49 AM
 */
var SettingsService = require('./setting');
var settingDefaults = require('./config');

module.exports = new SettingsService(settingDefaults);