/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/21/13 2:27 PM
 */
var settingService = require('../../setting');
var StatefulSetting = require('../../setting/stateful-setting');
var SabnzbdService = require('./sabnzbd');

var sabnzbdSettings = new StatefulSetting({
    options: 'downloaders:sabnzbd'
});

var sabnzbdService = new SabnzbdService(sabnzbdSettings.get().options);

//update settings in the service when they are updated in the config
sabnzbdSettings.on('updated', function (obj) {
    "use strict";
    sabnzbdService.updateSettings(obj.options);
});

module.exports = sabnzbdService;