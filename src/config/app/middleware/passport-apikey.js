/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/14/13 1:48 PM
 */

var LocalAPIKeyStrategy = require('passport-localapikey').Strategy;
var settingsService = require('../../../services/setting');
var _ = require('lodash');

module.exports = new LocalAPIKeyStrategy(function (apikey, done){
    'use strict';

    var localApiKey;
    localApiKey = settingsService.get("server:apiKey");
    console.log(localApiKey, apikey);
    if (localApiKey === apikey) {
        done(null, {
            name: 'local',
            apiKey: apikey
        });
    } else {
        done();
    }
});