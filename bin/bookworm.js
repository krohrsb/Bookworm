/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/10/13 10:20 AM
 */
'use strict';
var http = require('http');
var app = require('../src/app').createApp();
var settingsService = require('../src/services/setting');

var server = http.createServer(app);

server.listen((process.env.PORT || settingsService.get('server:port') || 3000), process.env.HOST || settingsService.get('server:host') || 'localhost', function () {
    console.log('Accepting incoming requests on ' + server.address().address + ':' + server.address().port + ' in ' + app.settings.env);
});
