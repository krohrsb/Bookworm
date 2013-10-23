/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/10/13 10:40 AM
 */
'use strict';
var Q = require('q');
var express = require('express');
var logger = require('../../services/log').logger();
var partialResponse = require('express-partial-response');
var metadataLinksBase = require('./middleware/metadata-links-base');
var metadataLinksPaging = require('./middleware/metadata-links-paging');
var passport = require('passport');
var apiKeyStrategy = require('./middleware/passport-apikey');


module.exports = function (app) {

    passport.use(apiKeyStrategy);

    // specify middleware
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.compress());
    app.use(express.methodOverride());
    app.use(express.static(__dirname + '/../../dist'));
    app.use(express.session({secret: '^wCE6LfbY!9Lr4H#SoPp0Xb'}));
    app.use(passport.initialize());
    app.use(passport.session());

    app.configure('production', function () {
        app.use(function (req, res, next) {
            passport.authenticate('localapikey', function (err, user) {
                if (err) {
                    next(err);
                } else if (!user) {
                    res.send(401);
                } else {
                    next();
                }
            })(req, res, next);
        });
    });

    app.use(metadataLinksBase);

    app.use(metadataLinksPaging);

    app.use(partialResponse());

    //app.use(requestLogger.create(logger));
    //app.use('/cache', express.static(__dirname + '/../../cache'));
    app.use(app.router);



    // log error
    app.use(function (err, req, res, next) {
        logger.error(err.message, {stack: err.stack, type: err.type});
        next(err);
    });

    // send error back as JSON if XHR
    app.use(function (err, req, res, next) {
        var error = {};
        res.status(err.statusCode || 500);
        if (req.xhr) {
            error.message = err.message;

            if (err.violations) {
                error.violations = err.violations;
            }

            res.json(error);
        } else {
            next(err);
        }
    });
};
