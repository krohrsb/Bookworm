/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/10/13 9:29 AM
 */
'use strict';

// Dependencies
var express = require('express');
var url = require('url');
var swagger = require('swagger-node-express');
var Q = require('q');
var passport = require('passport');
var flash = require('connect-flash');
var LocalStrategy = require('passport-local').Strategy;
var uuid = require('node-uuid');
var _ = require('lodash');
var path = require('path');
var swaggerize = require('swaggerize');

// Local Dependencies
var routesConfig = require('./config/routes');
var db = require('./config/models');
var logger = require('./services/log');
var partialResponse = require('./config/app/middleware/partial-response');
var metadataLinksBase = require('./config/app/middleware/metadata-links-base');
var metadataLinksPaging = require('./config/app/middleware/metadata-links-paging');
var settingService = require('./services/setting');
var customModels = require('./config/app/api-models');

// Variables
var users = {};
var scheduleService;
scheduleService = require('./services/schedule');

exports.createApp = function () {
    var app, appApi;

    app = express();
    appApi = express();

    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');
    //noinspection JSValidateTypes
    app.set('view options', {
        layout: false
    });
    app.disable('etag');

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
        logger.log('warn', 'API Key not set, generating a new one');
        settingService.set('server:apiKey', uuid.v4().replace(/-+/g, ''));
        settingService.save();
    }

    appApi.configure(function () {
        appApi.use(express.cookieParser());
        appApi.use(express.bodyParser());
        appApi.use(express.methodOverride());
        appApi.use(express.session({secret: '^wCE6LfbY!9Lr4H#SoPp0Xb', cookie: {maxAge: 24*60*60*1000}}));
        appApi.use(flash());
        //appApi.use(express.logger());
        appApi.use(metadataLinksBase);
        appApi.use(metadataLinksPaging);
        appApi.use(partialResponse({exclude: 'code,message'}));

        swagger.setAppHandler(appApi);

        //only allow requests that have a valid api key
        swagger.addValidator(function (req) {
            var query, apiKey, storedKey;
            query = url.parse(req.url, true).query;
            apiKey = query.apiKey || query.api_key;
            storedKey = settingService.get('server:apiKey');
            return ((!storedKey || storedKey === '') || apiKey === settingService.get('server:apiKey'));
        });

    });

    app.configure(function () {
        app.use(express.cookieParser());
        app.use(express.bodyParser());
        app.use(express.methodOverride());
        app.use(express.session({secret: '^wCE6LfbY!9Lr4H#SoPp0Xb', cookie: {maxAge: 24*60*60*1000}}));
        app.use(flash());
        app.use(passport.initialize());
        app.use(passport.session());
        app.use(app.router);

        //app.use(authenticate);
        app.use('/api/', appApi); /* mount `/api` using the appApi */
        // default document middleware for swagger/index.html
        app.use('/swagger', function(req, res, next) {
            if (req.url === '/swagger') {
                res.redirect('/swagger/');
            }
            next();
        });
        app.use('/swagger', express.static(path.join(__dirname, '../build/swagger')));
        app.use(express.static(path.join(__dirname, '../build/client')));


    });

    db.sequelize.sync().then(function () {
        var swaggerModelJSON;
        logger.log('info', 'Database synced.');
        swaggerModelJSON = swaggerize(db.sequelize);
        swagger.addModels(_.extend({}, swaggerModelJSON, customModels));
        routesConfig(app, swagger).then(function () {
            swagger.configureSwaggerPaths('', '/doc', '');
            swagger.configure('/api', require('../package.json').version);
        });

        //app.get('*', unknown);
    }, function (err) {
        logger.log('error', err.message, err.stack);
    });

    return app;

};