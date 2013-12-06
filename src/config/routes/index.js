/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/10/13 10:57 AM
 */
var Q = require('q');
var fs = require('fs-extra');
var path = require('path');
var logger = require('../../services/log').logger();

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
        logger.trace('Setting up controller[%s]', fileName.replace('.js', ''));
        controller.setup(app);
    } else {
        logger.error('Controller [%s] does not have a setup method, not initializing!', fileName);
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

    Q.fcall(function () {
        var deferred = Q.defer();
        fs.exists(controllersDirectory, deferred.resolve);
        return deferred.promise;
    })
    .then(function (exists) {
        if (exists) {
            return Q.nfcall(fs.readdir, controllersDirectory);
        } else {
            throw new Error('Controllers directory does not exist!');
        }
    })
    .then(function (files) {
        files.forEach(function (file) {
            // skipping index.js for last as it has the default routes
            if (file !== 'index.js') {
                initializeController(file, app);
            }
        });
        initializeController('index', app);
        logger.info('Application Started');
    }).catch(function (err) {
        logger.err(err);
    });
}
module.exports = initializeControllers;
