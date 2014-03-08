/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/10/13 2:41 PM
 */


// Dependencies
var swagger = require('swagger-node-express');
// Local Dependencies
var logService = require('../services/log');
var logger = require('../services/log');
var db = require('../config/models');
var util = require('../config/routes/util');


var logs = {
    spec: {
        path: '/logs',
        notes: 'Readonly log entries. Returns object with "data" property which is an array of log entries.',
        summary: 'Get Logs',
        method: 'GET',
        type : 'LogResult',
        nickname: 'getLogs',
        produces: ['application/json'],
        parameters: [
            util.params.offset,
            util.params.limit,
            util.params.fields
        ]
    },
    //noinspection JSUnusedLocalSymbols
    /**
     * Retrieve logs
     * @param {object} req - The Request object.
     * @param {object} res - The Response object.
     */
    action: function (req, res) {
        'use strict';
        logService.query({
            offset: req.query.offset,
            limit: req.query.limit
        }).then(function (results) {
            req.setPaging(results.total);
            res.json({
                data: results.data,
                _metadata: req._metadata
            });
        });
    }
};





function setup (app, swagger) {
    "use strict";
    swagger.addGet(logs);
}
module.exports.setup = setup;
