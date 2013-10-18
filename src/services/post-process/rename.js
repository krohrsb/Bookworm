/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/15/13 9:40 AM
 */

// Dependencies
var events = require('events');
var util = require('util');
var moment = require('moment');
var _ = require('lodash');

var RenameService = function () {
    "use strict";

    this._safePathRegex = '[^ 0-9a-zA-Z-[]()_\/]';

    events.EventEmitter.call(this);
};

util.inherits(RenameService, events.EventEmitter);


RenameService.prototype.resolvePatternPath = function (pattern, author, title, date) {
    "use strict";
    var replacers, firstLetter, path;

    path = pattern;

    firstLetter = author.slice(0, 1);

    replacers = {
        '$First': firstLetter.toUpperCase(),
        '$first': firstLetter.toLowerCase(),
        '$Author': author,
        '$author': author.toLowerCase(),
        '$Title': title,
        '$title': title.toLowerCase(),
        '$Date': moment(date).format('YYY-MM-DD')
    };

    _.forEach(replacers, function (value, key) {
        path = path.replace(key, value);
    });

    return (_.isEmpty(path)) ? null : path.replace(new RegExp(this._safePathRegex, 'g'), '');
};

module.exports = RenameService;