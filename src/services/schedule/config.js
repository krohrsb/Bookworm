/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/15/13 8:45 AM
 * @module schedule/config
 */
var settingsService = require('../setting');

module.exports = [{
    name: 'Post Process',
    action: function () {
        "use strict";
        console.log('TODO: post processing');
    },
    spec: function () {
        "use strict";
        return {
            minute: (settingsService.get('postProcessor:frequency') === 0) ? null : settingsService.get('postProcessor:frequency')
        };
    },
    settingsKey: 'postProcessor:frequency'
}];