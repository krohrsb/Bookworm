/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/15/13 9:39 AM
 */
var settingService = require('../setting');
var StatefulSetting = require('../setting/stateful-setting');
var PostProcessService = require('./post-process');

//create stateful setting object for newznab
var postProcessSettings = new StatefulSetting({
    frequency: 'postProcessor:frequency',
    downloadDirectory: 'postProcessor:downloadDirectory',
    destinationDirectory: 'postProcessor:destinationDirectory',
    folderFormat: 'postProcessor:folderFormat',
    fileFormat: 'postProcessor:fileFormat',
    keepOriginalFiles: 'postProcessor:keepOriginalFiles',
    directoryPermissions: 'postProcessor:directoryPermissions',
    opfName: 'postProcessor:opfName'
});


var postProcessService = new PostProcessService(postProcessSettings.get());

postProcessSettings.on('updated', function (options) {
    "use strict";
    postProcessService.updateSettings(options);
});

module.exports = postProcessService;