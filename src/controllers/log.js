/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/10/13 2:41 PM
 */
var logService = require('../services/log');

//noinspection JSUnusedLocalSymbols
/**
 * Retrieve logs
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function logs (req, res, next) {
    'use strict';

    logService.query({
        offset: req.query.offset,
        limit: req.query.limit,
        minLevel: req.query.minLevel
    }).then(function (results) {
        req.setPaging(results.total);
        res.json({
            data: results.data,
            _metadata: req._metadata
        });
    }, next);
}


function setup (app) {
    "use strict";
    app.get('/api/v1/logs', logs);
}
module.exports.setup = setup;
