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
 * Parse a newznab response
 * @param {object} response - response data
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

module.exports = NewznabParserService;