/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/18/13 4:59 PM
 */

// Dependencies
var swagger = require('swagger-node-express');
// Local Dependencies
var remoteRelease = require('../services/remote-release');
var logger = require('../services/log');
var db = require('../config/models');
var util = require('../config/routes/util');



var releases = {
    spec: {
        path: '/remote',
        notes: 'Search remote releases',
        summary: 'Search Remote Releases (newznab, for example)',
        method: 'GET',
        type : 'array',
        items: {
            $ref: 'object'
        },
        nickname: 'getRemoteReleases',
        produces: ['application/json'],
        parameters: [
            util.params.offset,
            util.params.limit,
            util.params.fields,
            util.params.direction,
            {
                name: 'title',
                description: 'Book Title',
                paramType: 'query',
                dataType: 'string',
                required: false
            },
            {
                name: 'author',
                description: 'Author Name',
                paramType: 'query',
                dataType: 'string',
                required: false
            }
        ]
    },
    /**
     * @param {object} req - The Request object.
     * @param {object} res - The Response object.
     */
    action: function (req, res) {
        'use strict';
        remoteRelease.query({
            title: req.query.title,
            author: req.query.author,
            sort: req.query.sort,
            direction: req.query.direction,
            limit: req.query.limit,
            offset: req.query.offset
        }).then(function (releases) {
            res.json(releases);
        });
    }
};

function setup (app, swagger) {
    "use strict";
    swagger.addGet(releases);
}
module.exports.setup = setup;
