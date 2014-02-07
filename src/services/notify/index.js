/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/16/13 9:05 AM
 */
var db = require('../../config/models');
var logger = require('../log').logger();
var NotificationService = require('./notify-manager');
var NotifyMyAndroid = require('./nma');

// Initialize the service
var notificationService = new NotificationService();

// Add our notifiers
notificationService.addNotifier(new NotifyMyAndroid({
    name: 'nma'
}));

// Listen to notify events and log them for posterity.
notificationService.on('notify', function (data) {
    "use strict";
    logger.log('info', 'Sent notification', data);
});

// Listen to verify events and log them for posterity.
notificationService.on('verify', function (data) {
    "use strict";
    logger.log('info', 'Verified notifier', data);
});

// Listen to book snatched events and attempt to notify.
db.emitter.on('book/snatched', function (book) {
    "use strict";
    notificationService.notify({
        event: 'Book Snatched',
        trigger: 'snatched',
        description: book.title
    });
});

// Listen to book downloaded events and attempt to notify.
db.emitter.on('book/downloaded', function (book) {
    "use strict";
    notificationService.notify({
        event: 'Book Downloaded',
        trigger: 'download',
        description: book.title
    });
});

module.exports = notificationService;