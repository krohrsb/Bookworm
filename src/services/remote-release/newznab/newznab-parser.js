/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/18/13 4:08 PM
 */

// Dependencies
var events = require('events');
var util = require('util');
var Q = require('q');
var _ = require('lodash');

/**
 * Newznab Parser Service - parses newznab data.
 * @constructor
 */
var NewznabParserService = function () {
    "use strict";
    events.EventEmitter.call(this);
};

util.inherits(NewznabParserService, events.EventEmitter);

/**
 * @name NewznabResponse
 * @property {object} channel
 */
/**
 * Parse a newznab response
 * @param {NewznabResponse} response - response data
 * @returns {Promise} A promise of type Promise<Object, Error>
 */
NewznabParserService.prototype.parseResponse = function (response) {
    "use strict";
    var deferred;
    deferred = Q.defer();

    if (_.isEmpty(response) || _.isEmpty(response.channel) || _.isEmpty(response.channel.item)) {
        deferred.resolve([]);
    } else {
        if (_.isArray(response.channel.item)) {
            response.channel.item.forEach(function (item) {
                item.channelTitle = response.channel.title;
            });
            deferred.resolve(response.channel.item);
        } else {
            response.channel.item.channelTitle = response.channel.title;
            deferred.resolve([response.channel.item]);
        }
    }
    return deferred.promise;
};

/**
 * Detect ignored words
 * @param {array} ignoredWords - list of ignored words to check for
 * @param {string} haystack - the string to check for ignored words
 * @returns {null|string}
 */
NewznabParserService.prototype.detectIgnoredWords = function (ignoredWords, haystack) {
    "use strict";
    var i, workingWord, ignoredWord;
    ignoredWord = null;
    if (haystack && ignoredWords && ignoredWords.length) {
        for (i = 0; i < ignoredWords.length; i = i + 1) {
            workingWord = ignoredWords[i];
            workingWord = workingWord.replace(/^\s+/g, '').replace(/\s+$/g, '');
            if (!_.isEmpty(workingWord) && haystack.indexOf(workingWord) !== -1) {
                ignoredWord = workingWord;
                break;
            }
        }
    }
    return ignoredWord;
};


module.exports = NewznabParserService;