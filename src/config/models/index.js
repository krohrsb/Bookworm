var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var _ = require('lodash');
var events = require('events');
var settingService = require('../../services/setting');

var databaseFilePath = path.join(settingService.get('environment:baseDirectory'), settingService.get('database:path'));

if (!fs.existsSync(path.dirname(databaseFilePath))) {
    fs.mkdirSync(path.dirname(databaseFilePath));
}

var sequelize = new Sequelize('bookworm', 'bookworm', 'test', {
    dialect: 'sqlite',
    storage: databaseFilePath,
    logging: false
});
/**
 * Database instance
 * @type {{emitter: events.EventEmitter, Book: Object, Author: Object, Release: Object}}
 */
var db = {
    emitter: new events.EventEmitter(),
    Author: {},
    Book: {},
    Release: {}
};

// Read for model js files and import them
fs.readdirSync(__dirname).filter(function (file) {
    "use strict";
    return (file.indexOf('.') !== 0) && (file !== 'index.js');
}).forEach(function (file) {
    "use strict";
    var model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
});

// Iterate the models and associate/hook them up
Object.keys(db).forEach(function(modelName) {
    if ('associate' in db[modelName]) {
        db[modelName].associate(db);
    }
    if ('hooks' in db[modelName]) {
        db[modelName].hooks(db);
    }
});

module.exports = _.extend({
    sequelize: sequelize,
    Sequelize: Sequelize
}, db);