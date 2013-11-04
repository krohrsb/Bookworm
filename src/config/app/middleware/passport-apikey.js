/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/14/13 1:48 PM
 */

var LocalAPIKeyStrategy = require('passport-localapikey').Strategy;
var settingService = require('../../../services/setting');
var _ = require('lodash');

/**
 * Passport Local API Key Strategy
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
module.exports = new LocalAPIKeyStrategy(function (apikey, done){
    'use strict';

    var localApiKey;
    localApiKey = settingService.get("server:apiKey");
    if (localApiKey === apikey) {
        done(null, {
            name: 'local',
            apiKey: apikey
        });
    } else {
        done();
    }
});