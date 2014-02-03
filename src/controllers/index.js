/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/10/13 12:58 PM
 */
var settingService = require('../services/setting');
var _ = require('lodash');
var logger = require('../services/log').logger();
//noinspection JSUnusedLocalSymbols
/**
 * Render the main index page
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function index (req, res, next) {
    'use strict';
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
    logger.log('debug', 'Rendering partial view', {path: category + ((name) ? '/' + name : '')});
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
    'use strict';
    res.send(401);
}

//noinspection JSUnusedLocalSymbols
/**
 * Login View Route
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function login (req, res, next) {
    'use strict';
    res.render('login', {
        env: settingService.get('environment:env'),
        apiKey: settingService.get('server:apiKey'),
        errors: req.flash('error')
    });
}

//noinspection JSUnusedLocalSymbols
/**
 * Logout
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function logout (req, res, next) {
    "use strict";
    req.logout();
    res.redirect('/');
}

/**
 * Check if auth is enabled
 * @returns {boolean}
 */
function isAuthEnabled () {
    'use strict';
    return !_.isEmpty(settingService.get('server:username'));
}

//noinspection JSUnusedLocalSymbols
/**
 * Ensure Auth middleware
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function ensureAuthenticated (req, res, next) {
    'use strict';
    if (!isAuthEnabled() || req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/login');
    }
}
/**
 * Set up the routes
 * @param {object} app - reference to express application.
 */
function setup (app) {
    'use strict';
    app.get('/', ensureAuthenticated, index);
    app.get('/partials/:category', partial);
    app.get('/partials/:category/:name', partial);
    app.get('/api/unauthorized', apiUnauthorized);
    app.get('/login', login);
    app.post('/auth/logout', logout);
    app.post('/auth/login', app.passport.authenticate('local', {failureRedirect: '/login', successRedirect: '/', failureFlash: true}));
    app.get('*', unknown);
}

module.exports.setup = setup;