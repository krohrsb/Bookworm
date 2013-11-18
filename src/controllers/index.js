/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/10/13 12:58 PM
 */
var settingService = require('../services/setting');

var logger = require('../services/log').logger();
//noinspection JSUnusedLocalSymbols
/**
 * Render the main index page
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function index (req, res, next) {
    "use strict";
    logger.trace('Controllers::index::index');
    res.render('index', {
        env: settingService.get('environment:env'),
        apiKey: settingService.get('server:apiKey')
    });
}

//noinspection JSUnusedLocalSymbols
/**
 * Render a partial by name
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function partial (req, res, next) {
    'use strict';
    var name, category;
    name = req.params.name;
    category = req.params.category;
    logger.trace('Controllers::index::partial(%s, %s)', category, name);
    res.render('partials/' + category + ((name) ? '/' + name : ''), {
        env: settingService.get('environment:env'),
        apiKey: settingService.get('server:apiKey')
    });
}

//noinspection JSUnusedLocalSymbols
/**
 * Default Route
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function unknown (req, res, next) {
    'use strict';
    logger.trace('Controllers::index::unknown');
    res.send(404);
}

//noinspection JSUnusedLocalSymbols
/**
 * API Unauthorized Route
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function apiUnauthorized (req, res, next) {
    "use strict";
    logger.trace('Controllers::index::apiUnauthorized');
    res.send(401);
}
/**
 * Set up the routes
 * @param {object} app - reference to express application.
 */
function setup (app) {
    "use strict";
    app.get('/', index);
    app.get('/partials/:category', partial);
    app.get('/partials/:category/:name', partial);
    app.get('/api/unauthorized', apiUnauthorized);
    app.get('*', unknown);
}

module.exports.setup = setup;