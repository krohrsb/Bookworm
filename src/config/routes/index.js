/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/10/13 10:57 AM
 */
var Q = require('q');
var qfs = require('q-io/fs');
var path = require('path');
var logger = require('../../services/log');
/**
 * Initialize a controller given its file name and a reference to the application.
 * @param {string} fileName - The controller file name. e.g., author.js
 * @param {object} app - Reference to the express application.
 */
function initializeController (fileName, app) {
    "use strict";
    var controller;
    controller = require('../../controllers/' + fileName);
    if (typeof controller.setup === 'function') {
        logger.log('debug', 'Setting up controller', { name: fileName.replace('.js', '') });
        controller.setup(app);
    } else {
        logger.log('error', 'Controller does not have a setup method, not initializing!', { name: fileName.replace('.js', '') });
    }
}

/**
 * Initialize all controllers in the controllers directory.
 * @param {object} app - Reference to the express application.
 */
function initializeControllers (app) {
    "use strict";
    var controllersDirectory;

    controllersDirectory = path.join(__dirname, '..', '..', 'controllers');

    qfs.exists(controllersDirectory)
    .then(function (exists) {
        if (exists) {
            return controllersDirectory;
        } else {
            throw new Error('Controllers Directory does not exist');
        }
    })
    .then(qfs.list)
    .then(function (files) {
        files.forEach(function (file) {
            // skipping index.js for last as it has the default routes
            if (file !== 'index.js') {
                initializeController(file, app);
            }
        });
        initializeController('index', app);
        logger.log('notice', 'Application Started');
    }).catch(function (err) {
        logger.log('error', err.message, err.stack);
    });
}
module.exports = initializeControllers;
