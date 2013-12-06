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
var flash = require('connect-flash');
var apiKeyStrategy = require('./middleware/passport-apikey');
var LocalStrategy = require('passport-local').Strategy;
var settingService = require('../../services/setting');
var uuid = require('node-uuid');
var _ = require('lodash');
var users = {};
module.exports = function (app) {

    /**
     * Serialize the passport user
     */
    passport.serializeUser(function(user, done) {
        users[user.id] = user;
        done(null, user.id);
    });

    /**
     * Deserialize the passport user
     */
    passport.deserializeUser(function(id, done) {
        if (users[id]) {
            done(null, users[id]);
        } else {
            done(new Error('could not locate session user'));
        }

    });
    //store for easy reference later
    app.passport = passport;
    //use api key strategy
    passport.use(apiKeyStrategy);

    //use local strategy
    passport.use(new LocalStrategy(function (username, password, done) {
        if (!_.isEmpty(settingService.get('server:username'))) {
            if (_.isEqual(username, settingService.get('server:username'))) {
                if (_.isEqual(password, settingService.get('server:password'))) {
                    return done(null, {user: username, id: 'local'});
                } else {
                    return done(null, false, { message: 'Invalid password.'});
                }
            } else {
                return done(null, false, { message: 'Incorrect username.' });
            }
        } else {
            return done(null, {user: 'noauth', id: 'local'});
        }
    }));

    //generate api key if one does not exist.
    if (!settingService.get('server:apiKey')) {
        logger.warn('API Key not set, generating a new one');
        settingService.set('server:apiKey', uuid.v4().replace(/-+/g, ''));
        settingService.save();
    }
    // specify middleware
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.compress());
    app.use(express.methodOverride());
    app.use(express.static(__dirname + '/../../../build/client'));
    app.use(express.session({secret: '^wCE6LfbY!9Lr4H#SoPp0Xb', cookie: {maxAge: 24*60*60*1000}}));
    app.use(flash());

    app.use(metadataLinksBase);

    app.use(metadataLinksPaging);

    app.use(partialResponse());
    app.use(passport.initialize());
    app.use(passport.session());

    //app.use(requestLogger.create(logger));
    //app.use('/cache', express.static(__dirname + '/../../cache'));
    app.use(app.router);



    // log error
    app.use(function (err, req, res, next) {
        logger.error(err.message, {data: {stack: err.stack, type: err.type}});
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
