/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/16/13 3:18 PM
 */

// Dependencies
var Schema = require('jugglingdb').Schema;
var path = require('path');
var fs = require('fs-extra');
var logger = require('../../services/log').logger();

// Local Dependencies
var settingService = require('../../services/setting');

var dbPath = path.join(settingService.get('environment:baseDirectory'), settingService.get('database:path'));

var exists = false;

try {
    exists = fs.existsSync(dbPath);
    if (!exists) {
        fs.createFileSync(dbPath);
    }
} catch (e) {
    logger.log('error', e.message, e.stack);
}


var db = new Schema('sqlite3', {
    database: dbPath
});

// Exports
module.exports = {
    db: db,
    exists: exists
};