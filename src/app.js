/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/10/13 9:29 AM
 */
'use strict';

var express = require('express');
var appConfig = require('./config/app');
var routesConfig = require('./config/routes');
var db = require('./config/models');
var logger = require('./services/log').logger();
exports.createApp = function () {
    var app;

    app = express();

    appConfig(app);

    routesConfig(app);

    db.sequelize.sync().then(function () {
        logger.log('info', 'Database synced.');
    }, function (err) {
        logger.log('error', err.message, err.stack);
    });


    return app;

};