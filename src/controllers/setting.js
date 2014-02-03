/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/11/13 4:13 PM
 */
var settingService = require('../services/setting');
var logger = require('../services/log').logger();
//noinspection JSUnusedLocalSymbols
/**
 * Retrieve settings
 * NOTE: you can also use this to get one by id technically with the partial response
 * e.g., settings?fields=data/loggers
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function settings (req, res, next) {
    'use strict';
    var data = settingService.get();

    if (data === null) {
        res.send(400);
    } else {
        res.json({
            data: data
        });
    }

}
//noinspection JSUnusedLocalSymbols
/**
 * Retrieve setting by id
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function byId (req, res, next) {
    'use strict';
    var data;
    if (req.params.id) {
        data = settingService.get(req.params.id);
    } else {
        data = null;
    }

    if (data === null) {
        res.send(400);
    } else {
        res.json({
            data: data
        });
    }
}

/**
 * Set settings, accepting a JSON object
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function set (req, res, next) {
    "use strict";
    var result;
    if (req.body) {

        result = settingService.setJSON(req.body);
        if (result && result[0]) {
            next(result[0]);
        } else {
            settingService.save().then(function () {
                res.send(200);
            }, next);
        }
    } else {
        res.send(400);
    }

}


function setup (app) {
    "use strict";
    app.get('/api/v1/settings', app.passport.authenticate('localapikey'), settings);
    app.get('/api/v1/settings/:id', app.passport.authenticate('localapikey'), byId);
    app.put('/api/v1/settings', app.passport.authenticate('localapikey'), set);
}
module.exports.setup = setup;
