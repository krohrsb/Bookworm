/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/15/13 8:45 AM
 * @module schedule/config
 */
var settingService = require('../setting');
var postProcessService = require('../post-process');

module.exports = [{
    name: 'Post Process',
    action: function () {
        "use strict";
        postProcessService.process();
    },
    spec: function () {
        "use strict";
        return {
            minute: (settingService.get('postProcessor:frequency') === 0) ? null : settingService.get('postProcessor:frequency')
        };
    },
    settingsKey: 'postProcessor:frequency'
}];