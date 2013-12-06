/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/18/13 5:03 PM
 */
var NewznabService = require('./newznab');
var settingService = require('../../setting');
var StatefulSetting = require('../../setting/stateful-setting');

//create stateful setting object for newznab
var newznabSettings = new StatefulSetting({
    providers: 'searchers:newznab:hosts'
});

//create stateful setting object for newznab api
var apiSettings = new StatefulSetting({
    userAgent: 'environment:userAgent',
    queryParams: {
        maxage: 'searchers:newznab:retention'
    },
    cacheOptions: {
        maxAge: 'searchers:newznab:cache'
    }
});

//create newznab service, getting and passing in initial settings
var newznabService = new NewznabService(newznabSettings.get(), apiSettings.get());

//update settings in the service when they are updated in the config
newznabSettings.on('updated', function (obj) {
    "use strict";
    newznabService.updateSettings(obj);
});
//update settings in the service when they are updated in the config
apiSettings.on('updated', function (obj) {
    "use strict";
    newznabService.updateAPISettings(obj);
});

module.exports = newznabService;