/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/15/13 10:01 AM
 */

// Dependencies
var events = require('events');
var util = require('util');
var _ = require('lodash');
var find = require('findit');

// Local Dependencies
var settingService = require('../setting/');

var FetchService = function () {
    "use strict";
    //path.dirname(path.join(this._settingsService.get('environment:baseDirectory'), this._settingsService.get('loggers:file:path')));
    events.EventEmitter.call(this);
};

util.inherits(FetchService, events.EventEmitter);


FetchService.prototype.getSnatchedBooks = function (next) {
    "use strict";
    next(null, [{
        id: 'xyz',
        title: 'Test',
        authorName: 'Bob',
        date: new Date()
    }]);
};

FetchService.prototype.getDownloadDirectoryBooks = function (next) {
    "use strict";
    var downloadDirectory, finder, directories;

    directories = [];
    downloadDirectory = settingService.get('postProcessor:downloadDirectory');

    finder = find(downloadDirectory);

    finder.on('directory', function (dir, stat, stop) {
        directories.push(dir);
    });

    finder.on('end', function () {
        next(null, directories);
    });
};

FetchService.prototype.getBooksForProcessing = function (next) {
    "use strict";

};

FetchService.prototype.matchDirectoryBook = function (book, directory, next) {
    "use strict";
    if (_.isEmpty(book)) {
        next(new Error('book is empty'));
    } else if (_.isEmpty(directory)) {
        next(new Error('directory is empty'));
    } else {
        if (directory.match(new RegExp('.bw(' + book.id + ')\/?$'))) {
            next(null, true);
        } else {
            next(null, false);
        }
    }
};
module.exports = FetchService;