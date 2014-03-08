/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/11/13 4:13 PM
 */

// Dependencies
var swagger = require('swagger-node-express');
var _ = require('lodash');
// Local Dependencies
var logger = require('../services/log');
var settingService = require('../services/setting');
var db = require('../config/models');
var util = require('../config/routes/util');


var settings = {
    spec: {
        path: '/settings',
        notes: 'Returns all settings',
        summary: 'Get Settings',
        method: 'GET',
        type : 'object',
        nickname: 'getSettings',
        produces: ['application/json'],
        parameters: [
            util.params.fields
        ],
        responseMessages: [util.errors.invalid('SettingsData')]
    },
    /**
     * Retrieve settings
     * NOTE: you can also use this to get one by id technically with the partial response
     * e.g., settings?fields=data/loggers
     * @param {object} req - The Request object.
     * @param {object} res - The Response object.
     */
    action: function (req, res) {
        'use strict';
        var data = settingService.get();

        if (data === null) {
            util.errors.invalid('SettingsData', res);
        } else {
            res.json({
                data: data
            });
        }

    }
};

var byId = {
    spec: {
        path: '/settings/{id}',
        notes: '',
        summary: 'Get Setting by id',
        method: 'GET',
        type: 'object',
        nickname: 'getSettingById',
        produces: ['application/json'],
        parameters: [
            util.params.id,
            util.params.fields
        ],
        responseMessages: [util.errors.notFound('Setting'), util.errors.invalid('id')]
    },
    /**
     * Retrieve setting by id
     * @param {object} req - The Request object.
     * @param {object} res - The Response object.
     */
    action: function (req, res) {
        'use strict';
        var data;

        if (!req.params.id) {
            util.errors.invalid('id', res);
        } else {
            data = settingService.get(req.params.id);
            if (data === null || _.isEmpty(data)) {
                util.errors.notFound('Setting', res);
            } else {
                res.json({
                    data: data
                });
            }
        }
    }
};


var setSettings = {
    spec: {
        path: '/settings',
        notes: '',
        summary: 'Update Settings',
        method: 'PUT',
        nickname: 'updateSettings',
        produces: ['application/json'],
        parameters: [
            {
                name: 'settings',
                description: 'Settings JSON',
                paramType: 'body',
                dataType: 'object',
                required: true
            },
            util.params.fields
        ],
        responseMessages: [
            util.errors.invalid('Settings')
        ]
    },
    /**
     * Set settings, accepting a JSON object
     * @param {object} req - The Request object.
     * @param {object} res - The Response object.
     */
    action: function (req, res) {
        "use strict";
        var result;
        if (req.body) {
            result = settingService.setJSON(req.body);
            if (result && result[0]) {
                util.errors.invalid('Settings', res);
            } else {
                settingService.save().then(function () {
                    res.json(200, {});
                }, function () {
                    util.errors.invalid('Settings', res);
                });
            }
        } else {
            util.errors.invalid('Settings', res);
        }

    }
};

var getEnvironment = {
    spec: {
        path: '/environment',
        notes: 'Returns environment variables',
        summary: 'Get Environment Variables',
        method: 'GET',
        type : 'object',
        nickname: 'getEnvironment',
        produces: ['application/json'],
        parameters: [
            util.params.fields
        ]
    },
    /**
     * Retrieve environment info
     * @param {object} req - The Request object.
     * @param {object} res - The Response object.
     */
    action: function (req, res) {
        "use strict";
        res.send({
            env: settingService.get('environment:env'),
            configFile: settingService.get('environment:configFile'),
            baseDirectory: settingService.get('environment:baseDirectory'),
            package: settingService.get('environment:package'),
            userAgent: settingService.get('environment:userAgent'),
            databaseFile: settingService.get('database:path'),
            logFile: settingService.get('loggers:file:path')
        });
    }
};



function setup (app, swagger) {
    "use strict";
    swagger.addGet(getEnvironment);
    swagger.addGet(settings);
    swagger.addGet(byId);
    swagger.addPut(setSettings);
}
module.exports.setup = setup;
