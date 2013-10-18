/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/15/13 10:30 AM
 */
var GoogleBooks = require('./google-books');
var settingService = require('../../setting');

module.exports = new GoogleBooks({
    userAgent: settingService.get('environment:userAgent'),
    queryParams: {
        key: settingService.get('searchers:googleBooks:apiKey'),
        langRestrict: settingService.get('searchers:googleBooks:language')
    },
    cacheOptions: {
        maxAge: settingService.get('searchers:googleBooks:cache')
    }
});