/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/10/13 10:46 AM
 */
var middleware = require('./middleware');
var properties = require('./properties');

var scheduleService;
scheduleService = require('../../services/schedule');

module.exports = function (app) {
    "use strict";
    properties(app);
    middleware(app);
};
