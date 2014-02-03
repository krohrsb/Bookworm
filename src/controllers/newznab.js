/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/18/13 4:59 PM
 */

var remoteRelease = require('../services/remote-release');
var logger = require('../services/log').logger();
//noinspection JSUnusedLocalSymbols
/**
 *
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function releases (req, res, next) {
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
    }, next);
}


function setup (app) {
    "use strict";
    app.get('/api/v1/releases', app.passport.authenticate('localapikey'), releases);
}
module.exports.setup = setup;
