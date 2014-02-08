/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/16/13 9:05 AM
 */
var db = require('../../config/models');
var logger = require('../log').logger();
var NotificationService = require('./notify-manager');
var NotifyMyAndroid = require('./nma');
var Pushover = require('./pushover');
// Initialize the service
var notificationService = new NotificationService();

// Add our notifiers
notificationService.addNotifier(new NotifyMyAndroid({
    name: 'nma'
}));

notificationService.addNotifier(new Pushover({
    name: 'pushover'
}));

// Listen to notify events and log them for posterity.
notificationService.on('notify', function (data) {
    "use strict";
    logger.log('info', 'Sent notification', data);
});

// Listen to book snatched events and attempt to notify.
db.emitter.on('book/snatched', function (book) {
    "use strict";
    notificationService.notify('snatched', book);
});

// Listen to book downloaded events and attempt to notify.
db.emitter.on('book/downloaded', function (book) {
    "use strict";
    notificationService.notify('downloaded', book);
});

/*
 description: book.title,
 url: book.apiLink,
 urlTitle: book.title + '@' + book.provider
 */
module.exports = notificationService;