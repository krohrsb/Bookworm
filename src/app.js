/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/10/13 9:29 AM
 */
'use strict';

var express = require('express');
var appConfig = require('./config/app');
var routesConfig = require('./config/routes');
var databaseConfig = require('./config/database');
var modelsConfig = require('./config/database/models');

exports.createApp = function () {
    var app;

    app = express();

    appConfig(app);

    routesConfig(app);

    modelsConfig(databaseConfig);


    return app;

};
