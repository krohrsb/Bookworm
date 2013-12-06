/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/15/13 10:30 AM
 */
var GoogleBooks = require('./google-books');
var settingService = require('../../setting');
var StatefulSetting = require('../../setting/stateful-setting');

var googleBooksSettings = new StatefulSetting({
    userAgent: 'environment:userAgent',
    queryParams: {
        key: 'searchers:googleBooks:apiKey',
        langRestrict: 'searchers:googleBooks:language'
    },
    cacheOptions: {
        maxAge: 'searchers:googleBooks:cache'
    }
});

var googleBooks = new GoogleBooks(googleBooksSettings.get());

//update settings in the service when they are updated in the config
googleBooksSettings.on('updated', function (obj) {
    "use strict";
    googleBooks.updateSettings(obj);
});

module.exports = googleBooks;