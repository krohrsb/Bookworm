/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/16/13 3:18 PM
 */

// Dependencies
var Schema = require('jugglingdb').Schema;
var path = require('path');

// Local Dependencies
var settingService = require('../../services/setting');

var db = new Schema('sqlite3', {
    database: path.join(settingService.get('environment:base'), settingService.get('database:path'))
});

// Exports
module.exports = db;